import type { Opportunity, ComplianceResult, Platform } from '../../types'
import { PLATFORM_RULES } from '../../types'

export function checkCompliance(
  content: string,
  platform: Platform,
  includesLink: boolean,
  linkContext?: string,
): ComplianceResult {
  const lower = content.toLowerCase()
  const rules = PLATFORM_RULES[platform]
  const checks = []

  const firstPara = lower.split('\n\n')[0] ?? ''
  const linkInOpener = includesLink && (firstPara.includes('hrmony') || firstPara.includes('our platform') || firstPara.includes('our tool'))
  checks.push({ label: 'Lead with value, not promotion', status: linkInOpener ? 'fail' : 'pass', note: linkInOpener ? 'Move any product mention out of the opening paragraph.' : undefined } as const)

  if (rules.disclosure && includesLink) {
    const hasDisclosure = ['full disclosure', 'i work at', 'i built', 'disclaimer', 'i\'m affiliated', 'i am affiliated', 'hrmony.ai team'].some((p) => lower.includes(p))
    checks.push({ label: 'Affiliate disclosure required on this platform', status: hasDisclosure ? 'pass' : 'warn', note: hasDisclosure ? undefined : 'Add a disclosure e.g. "Full disclosure: I work at hrmony.ai."' } as const)
  }

  const banned = ['sign up now', 'try it free', 'book a demo', 'click here', '#1 platform', 'best-in-class', 'game changer', 'revolutionary']
  const found = banned.filter((p) => lower.includes(p))
  checks.push({ label: 'No marketing / promotional language', status: found.length > 0 ? 'fail' : 'pass', note: found.length > 0 ? `Remove: ${found.join(', ')}` : undefined } as const)

  const words = content.trim().split(/\s+/).filter(Boolean).length
  checks.push({ label: 'Substantive length (100+ words)', status: words >= 100 ? 'pass' : words >= 60 ? 'warn' : 'fail', note: words < 100 ? `${words} words — expand with more useful detail.` : undefined } as const)

  if (includesLink) {
    const hasContext = (linkContext ?? '').trim().length > 15
    checks.push({ label: 'Product link is contextually justified', status: hasContext ? 'pass' : 'warn', note: hasContext ? undefined : 'Explain why hrmony.ai is specifically relevant to this question.' } as const)
  }

  const hasFail = checks.some((r) => r.status === 'fail')
  const hasWarn = checks.some((r) => r.status === 'warn')
  return { overall: hasFail ? 'fail' : hasWarn ? 'warn' : 'pass', rules: checks }
}

export async function generateDraft(
  opp: Opportunity,
  includeLink = true,
): Promise<{ title?: string; content: string }> {
  try {
    const res = await fetch('/api/generate-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunity: opp, includeLink }),
    })
    const data = await res.json().catch(() => null)
    if (res.ok && data?.content) return data
    // Show full debug response so we can diagnose
    return { content: JSON.stringify(data, null, 2) }
  } catch (err) {
    return { content: `[Network Error]: ${String(err)}` }
  }
}
