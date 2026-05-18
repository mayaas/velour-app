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
  const linkInOpener = includesLink && (firstPara.includes('harmonai') || firstPara.includes('our platform') || firstPara.includes('our tool'))
  checks.push({
    label: 'Lead with value, not promotion',
    status: linkInOpener ? 'fail' : 'pass',
    note: linkInOpener ? 'Move any product mention out of the opening paragraph.' : undefined,
  } as const)

  if (rules.disclosure && includesLink) {
    const hasDisclosure = ['full disclosure', 'i work at', 'i built', 'disclaimer', 'i\'m affiliated', 'i am affiliated', 'harmonai team'].some((p) => lower.includes(p))
    checks.push({
      label: 'Affiliate disclosure required on this platform',
      status: hasDisclosure ? 'pass' : 'warn',
      note: hasDisclosure ? undefined : 'Add a disclosure e.g. "Full disclosure: I work at Harmonai."',
    } as const)
  }

  const banned = ['sign up now', 'try it free', 'book a demo', 'click here', '#1 platform', 'best-in-class', 'game changer', 'revolutionary']
  const found = banned.filter((p) => lower.includes(p))
  checks.push({
    label: 'No marketing / promotional language',
    status: found.length > 0 ? 'fail' : 'pass',
    note: found.length > 0 ? `Remove: ${found.join(', ')}` : undefined,
  } as const)

  const words = content.trim().split(/\s+/).filter(Boolean).length
  checks.push({
    label: 'Substantive length (100+ words)',
    status: words >= 100 ? 'pass' : words >= 60 ? 'warn' : 'fail',
    note: words < 100 ? `${words} words — expand with more useful detail.` : undefined,
  } as const)

  if (includesLink) {
    const hasContext = (linkContext ?? '').trim().length > 15
    checks.push({
      label: 'Product link is contextually justified',
      status: hasContext ? 'pass' : 'warn',
      note: hasContext ? undefined : 'Explain why Harmonai is specifically relevant to this question.',
    } as const)
  }

  const hasFail = checks.some((r) => r.status === 'fail')
  const hasWarn = checks.some((r) => r.status === 'warn')

  return {
    overall: hasFail ? 'fail' : hasWarn ? 'warn' : 'pass',
    rules: checks,
  }
}

export async function generateDraft(
  opp: Opportunity,
  includeLink = false,
): Promise<{ title?: string; content: string }> {
  await new Promise((r) => setTimeout(r, 1600))
  return buildDraft(opp, includeLink)
}

function buildDraft(opp: Opportunity, includeLink: boolean): { title?: string; content: string } {
  if (opp.type === 'article' || opp.platform === 'medium') return buildArticle(opp, includeLink)
  if (opp.platform === 'hackernews' || opp.platform === 'devto') return buildTechnical(opp, includeLink)
  return buildQA(opp, includeLink)
}

function buildQA(_opp: Opportunity, includeLink: boolean): { content: string } {
  const disclosure = includeLink
    ? '\n\n*Full disclosure: I work at Harmonai, so I have direct experience with this — but the points above apply regardless of which tools you use.*'
    : ''

  const productMention = includeLink
    ? '\n\nIf you\'re evaluating platforms: Harmonai is built specifically around this use case. Happy to share more detail on how we approach it if useful.'
    : ''

  return {
    content: `This is one of the more important questions in the space right now, and the honest answer is more nuanced than most vendor content suggests.

The teams getting the most out of AI in recruitment tend to share a few characteristics:

**They define the problem precisely before buying a tool.** "Use AI in recruiting" is not a problem statement. "Reduce time-to-shortlist for engineering roles without sacrificing diversity metrics" is. The specificity determines which capabilities actually matter.

**They treat AI as augmentation, not replacement.** The strongest setups use AI to handle the parts that don't require judgment — initial signal extraction, structured data enrichment, duplicate detection — and keep humans accountable for decisions that affect people's careers.

**They measure what changes, not just what speeds up.** Time-to-hire improving by 30% is easy to instrument. Whether quality-of-hire or diversity at offer stage improved is harder and more important. Teams that track the latter build more durable processes.

**They audit continuously, not just at launch.** AI models drift. What looked unbiased at deployment can develop skew over time as the candidate pool or job market shifts. The organisations doing this well have a lightweight audit cadence built into the process from day one.

The tools matter less than the implementation rigour. The same platform can produce dramatically different results depending on how carefully it's configured and monitored.${productMention}${disclosure}`,
  }
}

function buildArticle(_opp: Opportunity, includeLink: boolean): { title: string; content: string } {
  const productSection = includeLink
    ? '\n\n## What We\'ve Learned at Harmonai\n\nBuilding in this space has given us a close view of where AI delivers genuine leverage and where it falls short. The patterns above reflect what we\'ve seen across implementations, not just theory.\n\n*Disclosure: I work at Harmonai, an AI recruitment platform.*'
    : ''

  return {
    title: "AI in Recruitment: A Practitioner's Honest Guide",
    content: `Most writing about AI in recruitment falls into two categories: breathless optimism from vendors, or reflexive scepticism from commentators who haven't seen it work. This piece tries to offer something more useful: a practitioner's view of what's actually true.

## What AI Does Well in Recruitment

**Signal extraction at scale.** Reviewing hundreds of applications for structured signals — relevant experience, skill alignment, career trajectory — is exactly the kind of pattern-matching that ML handles well. Not judgment, but signal. The distinction matters.

**Consistency.** Humans are inconsistent screeners. Fatigue, recency bias, and order effects measurably affect decisions. A well-calibrated AI evaluates the 200th application the same way it evaluates the first. This is a real advantage, not a talking point.

**Speed on high-volume roles.** For roles with 500+ applicants, AI can compress initial screening from weeks to hours without sacrificing coverage.

## Where It Breaks Down

**When the brief is wrong.** AI optimises for what you tell it to. If your job description conflates requirements with nice-to-haves, the model will filter on noise. Garbage in, garbage out — at scale.

**When diversity isn't explicitly designed for.** AI trained on historical hiring data will replicate historical patterns, including historical biases. This isn't hypothetical; it's documented. Mitigation requires active design, not just a bias checkbox at procurement.

**When there's no human in the loop for decisions.** AI can rank. It should not decide. Every implementation that treats AI output as a final decision rather than an input to human judgment creates legal and ethical exposure.

## The Honest Summary

AI makes recruitment faster and more consistent when implemented carefully. It makes it faster and more consistently biased when it isn't. The differentiator isn't the technology — it's the implementation rigour.${productSection}`,
  }
}

function buildTechnical(_opp: Opportunity, includeLink: boolean): { content: string } {
  const disclosure = includeLink
    ? '\n\n> Disclosure: I work at Harmonai, which builds in this space, so I have hands-on context here.'
    : ''

  return {
    content: `The gap between "we use AI for hiring" and "we use AI well for hiring" is mostly an engineering and process discipline problem, not a model problem.

A few patterns from production implementations worth sharing:

**Structured outputs over free-text scoring.** Models asked to produce a score from 1-10 are far less reliable than models asked to extract structured signals: "Does the candidate have direct experience with X? Y/N. Evidence: [quote from CV]." The structured form is auditable, debuggable, and less susceptible to hallucination.

**Embedding-based matching, not keyword matching.** JD-to-CV keyword matching is a solved problem from 2010. The lift from semantic embeddings (e.g. identifying that "built distributed systems" and "experience with microservices architecture" are related) is real and measurable — typically 15-25% improvement in recall at fixed precision.

**Bias auditing as a pipeline stage, not an afterthought.** The practical approach: after each model run, compute demographic parity and equalised odds metrics across the shortlisted vs. rejected pool. Flag runs that exceed a threshold for human review. This doesn't require knowing candidate demographics — proxies via name/location models exist, though they introduce their own imprecision.

**Explainability for candidate feedback.** Regulators (and candidates, increasingly) want to know why a decision was made. Designing for this from the start — storing the model's reasoning alongside its output — is much cheaper than retrofitting it.

The tooling is largely commoditised. The differentiation is in how carefully you instrument, audit, and close the feedback loop.${disclosure}`,
  }
}
