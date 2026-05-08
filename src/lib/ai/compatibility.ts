import type { UserProfile, UserBoundary, CompatibilityBreakdown } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompatibilityRequest {
  userA: UserProfile
  userB: UserProfile
  boundariesA: UserBoundary[]
  boundariesB: UserBoundary[]
}

export interface CompatibilityResult {
  breakdown: CompatibilityBreakdown
  summary: string
  greenFlags: string[]
  yellowFlags: string[]
  redFlags: string[]
  aiInsight: string
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

function buildCompatibilityPrompt(req: CompatibilityRequest): string {
  const formatProfile = (p: UserProfile) => `
Name: ${p.display_name}, Age: ${p.age}
Relationship type: ${p.relationship_type}
Attachment style: ${p.attachment_style || 'unknown'}
Dynamic role: ${p.dynamic_role || 'none'}
Exploration level: ${p.exploration_level || 3}/5
Bio: ${p.bio || 'No bio'}
  `.trim()

  const formatBoundaries = (boundaries: UserBoundary[]) => {
    if (!boundaries.length) return 'Not set'
    return boundaries
      .map(b => `${b.boundary_id}: ${b.level}`)
      .join(', ')
  }

  return `You are a relationship compatibility AI for Velour, a sophisticated human dynamics platform.

Analyze the compatibility between these two people and return a JSON response ONLY.

PERSON A:
${formatProfile(req.userA)}
Boundaries: ${formatBoundaries(req.boundariesA)}

PERSON B:
${formatProfile(req.userB)}
Boundaries: ${formatBoundaries(req.boundariesB)}

Return ONLY valid JSON with this exact structure:
{
  "breakdown": {
    "emotional": 0.0-1.0,
    "communication": 0.0-1.0,
    "exploration": 0.0-1.0,
    "dynamic": 0.0-1.0,
    "boundaries": 0.0-1.0,
    "values": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "summary": "1-2 sentence summary of why they match",
  "greenFlags": ["up to 3 positive compatibility notes"],
  "yellowFlags": ["up to 2 things to navigate together"],
  "redFlags": ["boundary conflicts only, empty if none"],
  "aiInsight": "One thoughtful, warm sentence about their unique dynamic"
}

Rules:
- overall = weighted average (emotional 25%, communication 20%, dynamic 20%, boundaries 20%, exploration 15%)
- red flags ONLY for hard boundary conflicts
- Be honest but warm
- No markdown, no explanation — JSON only`
}

// ─── Claude API call ──────────────────────────────────────────────────────────

export async function computeCompatibility(
  req: CompatibilityRequest
): Promise<CompatibilityResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildCompatibilityPrompt(req) }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean) as CompatibilityResult
    return result
  } catch {
    // Fallback: compute basic score from boundaries
    return computeFallbackCompatibility(req)
  }
}

// ─── Fallback (no API) ────────────────────────────────────────────────────────

function computeFallbackCompatibility(req: CompatibilityRequest): CompatibilityResult {
  const { userA, userB, boundariesA, boundariesB } = req

  // Boundary conflict check
  const boundaryMapA = Object.fromEntries(boundariesA.map(b => [b.boundary_id, b.level]))
  const boundaryMapB = Object.fromEntries(boundariesB.map(b => [b.boundary_id, b.level]))

  let conflicts = 0
  let alignments = 0
  const redFlags: string[] = []

  for (const [id, levelA] of Object.entries(boundaryMapA)) {
    const levelB = boundaryMapB[id]
    if (!levelB) continue
    if (levelA === 'hard_no' && (levelB === 'enthusiastic_yes' || levelB === 'open_to')) {
      conflicts++
      redFlags.push(`Boundary conflict: ${id}`)
    } else if (
      (levelA === 'enthusiastic_yes' && levelB === 'enthusiastic_yes') ||
      (levelA === 'open_to' && levelB === 'open_to')
    ) {
      alignments++
    }
  }

  // Exploration alignment
  const expA = userA.exploration_level || 3
  const expB = userB.exploration_level || 3
  const expDiff = Math.abs(expA - expB)
  const explorationScore = Math.max(0, 1 - expDiff * 0.2)

  // Dynamic alignment
  const dynamicScore =
    userA.dynamic_role === 'switch' || userB.dynamic_role === 'switch'
      ? 0.85
      : (userA.dynamic_role === 'dominant' && userB.dynamic_role === 'submissive') ||
        (userA.dynamic_role === 'submissive' && userB.dynamic_role === 'dominant')
      ? 0.95
      : userA.dynamic_role === userB.dynamic_role
      ? 0.6
      : 0.7

  // Attachment alignment
  const attachmentScore =
    userA.attachment_style === 'secure' || userB.attachment_style === 'secure' ? 0.85 : 0.7

  const boundariesScore = Math.max(0, 1 - conflicts * 0.3 + alignments * 0.05)
  const overall =
    attachmentScore * 0.25 +
    0.75 * 0.2 +
    explorationScore * 0.15 +
    dynamicScore * 0.2 +
    boundariesScore * 0.2

  return {
    breakdown: {
      emotional: attachmentScore,
      communication: 0.75,
      exploration: explorationScore,
      dynamic: dynamicScore,
      boundaries: boundariesScore,
      values: 0.78,
      overall: Math.min(0.99, overall),
    },
    summary: `${userA.display_name} and ${userB.display_name} share ${alignments} aligned boundaries and complementary dynamics.`,
    greenFlags: [
      'Complementary dynamic roles',
      `Similar exploration levels (${expA}/5 vs ${expB}/5)`,
      'Secure attachment foundation',
    ].slice(0, 3),
    yellowFlags: expDiff > 1 ? ['Different exploration comfort levels to discuss'] : [],
    redFlags,
    aiInsight: `A connection worth exploring — with ${alignments} shared values and open communication, this dynamic has real potential.`,
  }
}

// ─── Batch compatibility for discover feed ────────────────────────────────────

export async function rankProfilesByCompatibility(
  currentUser: UserProfile,
  currentBoundaries: UserBoundary[],
  candidates: UserProfile[],
  candidateBoundaries: Record<string, UserBoundary[]>
): Promise<Array<{ profile: UserProfile; compatibility: CompatibilityResult }>> {
  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const result = await computeCompatibility({
        userA: currentUser,
        userB: candidate,
        boundariesA: currentBoundaries,
        boundariesB: candidateBoundaries[candidate.id] || [],
      })
      return { profile: candidate, compatibility: result }
    })
  )

  return results.sort((a, b) => b.compatibility.breakdown.overall - a.compatibility.breakdown.overall)
}
