// ─── AI Coach message types ───────────────────────────────────────────────────

export type CoachMode = 
  | 'boundaries'      // Help draft/explain boundaries
  | 'communication'   // Help write a difficult message
  | 'jealousy'        // Jealousy management
  | 'compatibility'   // Explain a match score
  | 'bio'             // Help write profile bio
  | 'general'         // Open chat

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── System prompts per mode ──────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<CoachMode, string> = {
  boundaries: `You are Velour's Boundaries Coach — a warm, non-judgmental AI assistant helping people articulate their limits and desires clearly and compassionately. You help users:
- Understand what their boundaries are
- Put them into words for difficult conversations
- Navigate when boundaries are challenged
- Distinguish hard limits from soft preferences

You never judge any consensual dynamic. You're supportive, clear, and grounded. Keep responses concise (2-4 short paragraphs max). Always end with a practical next step.`,

  communication: `You are Velour's Communication Coach. You help people express themselves authentically in relationship conversations — especially difficult ones. You assist with:
- Starting hard conversations
- Expressing needs without blame
- Responding to sensitive messages
- Setting up check-ins

Be warm, practical, and specific. Offer draft language they can use verbatim or adapt. Keep it real — not therapy-speak.`,

  jealousy: `You are Velour's Emotional Intelligence Coach, specializing in navigating jealousy in open, poly, and non-monogamous relationships. You help people:
- Identify the root of jealous feelings
- Communicate them constructively
- Build security in non-traditional structures
- Distinguish jealousy from boundary violations

Be empathetic and non-pathologizing. Jealousy is information, not a flaw. Offer practical tools, not just validation.`,

  compatibility: `You are Velour's Compatibility Interpreter. You explain AI compatibility scores in human terms — what they mean, what to focus on, and what to discuss before meeting. Be honest about both strengths and areas to navigate. Keep it warm and useful.`,

  bio: `You are a profile writing assistant for Velour. Help users write a bio that is:
- Authentic and specific (not generic)
- Intriguing without oversharing
- Clear about what they're looking for
- Between 80-150 words

Ask 2-3 targeted questions before drafting. Avoid clichés like "I love to laugh" or "looking for my partner in crime."`,

  general: `You are Velour's AI assistant — thoughtful, non-judgmental, and knowledgeable about relationships, consent, communication, and human dynamics. You support people exploring alternative relationship structures with intelligence and warmth. Keep responses focused and practical.`,
}

// ─── Single message to Claude ─────────────────────────────────────────────────

export async function sendCoachMessage(
  mode: CoachMode,
  history: CoachMessage[],
  userMessage: string
): Promise<string> {
  const messages = [
    ...history,
    { role: 'user' as const, content: userMessage },
  ]

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPTS[mode],
        messages,
      }),
    })

    const data = await response.json()
    return data.content?.[0]?.text || 'Something went wrong. Please try again.'
  } catch {
    return 'Connection issue. Please check your connection and try again.'
  }
}

// ─── Stream version (for typewriter effect) ───────────────────────────────────

export async function streamCoachMessage(
  mode: CoachMode,
  history: CoachMessage[],
  userMessage: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const messages = [
    ...history,
    { role: 'user' as const, content: userMessage },
  ]

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        stream: true,
        system: SYSTEM_PROMPTS[mode],
        messages,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) { onDone(); return }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6))
          if (json.type === 'content_block_delta' && json.delta?.text) {
            onChunk(json.delta.text)
          }
        } catch { /* skip */ }
      }
    }
  } catch (err) {
    onChunk('Connection issue. Please try again.')
  } finally {
    onDone()
  }
}

// ─── Quick prompts per mode ───────────────────────────────────────────────────

export const QUICK_PROMPTS: Record<CoachMode, string[]> = {
  boundaries: [
    "Help me explain my hard limits to a new match",
    "How do I say no to something I'm unsure about?",
    "My boundary was crossed — how do I address it?",
  ],
  communication: [
    "Help me start a conversation about exclusivity",
    "I need to express that I felt disrespected",
    "How do I ask for more consistency without pressure?",
  ],
  jealousy: [
    "I'm feeling jealous of my partner's other connection",
    "How do I tell if jealousy is a red flag or normal?",
    "My partner is jealous and I don't know how to help",
  ],
  compatibility: [
    "Explain what an 87% match score means",
    "Our dynamic scores differ — is that bad?",
    "What should we discuss before our first meeting?",
  ],
  bio: [
    "Help me write my profile bio from scratch",
    "My bio feels generic — can you improve it?",
    "I'm in a couple — how do we write a joint bio?",
  ],
  general: [
    "What is ethical non-monogamy?",
    "How do I know if open relationship is right for me?",
    "What's the difference between poly and open?",
  ],
}
