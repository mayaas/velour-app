import type {
  MarketingDraft,
  MarketingOpportunity,
  ComplianceCheck,
  ComplianceRule,
  ComplianceLevel,
} from '../../types/marketing'
import { PLATFORM_RULES } from '../../types/marketing'

// ─── Compliance Checker ───────────────────────────────────────────────────────

export function runComplianceCheck(draft: Pick<MarketingDraft, 'content' | 'platform' | 'includes_product_link' | 'product_link_context'>): ComplianceCheck {
  const platformRules = PLATFORM_RULES[draft.platform]
  const content = draft.content.toLowerCase()
  const rules: ComplianceRule[] = []

  // Rule: Answer/value comes first
  const firstParagraph = content.split('\n\n')[0] ?? ''
  const linkInFirst = draft.includes_product_link && firstParagraph.includes('velour')
  rules.push({
    rule: 'Lead with value, not promotion',
    status: linkInFirst ? 'fail' : 'pass',
    note: linkInFirst ? 'Product mention appears in the opening paragraph. Move it to later in the response.' : undefined,
  })

  // Rule: Disclosure when required
  if (platformRules.requiresDisclosure && draft.includes_product_link) {
    const hasDisclosure = content.includes('disclosure') || content.includes('disclaimer') || content.includes('i work') || content.includes('full disclosure') || content.includes('transparency') || content.includes('i built') || content.includes("i'm affiliated") || content.includes('i am affiliated')
    rules.push({
      rule: 'Affiliate disclosure when linking your product',
      status: hasDisclosure ? 'pass' : 'warn',
      note: hasDisclosure ? undefined : `${platformRules.name} requires you to disclose your affiliation when mentioning your own product.`,
    })
  }

  // Rule: No overt marketing language
  const marketingPhrases = ['best app', 'try it free', 'sign up now', 'click here', 'limited offer', 'download now', 'get started today', '#1', 'number one']
  const foundPhrases = marketingPhrases.filter((p) => content.includes(p))
  rules.push({
    rule: 'No promotional/marketing language',
    status: foundPhrases.length > 0 ? 'fail' : 'pass',
    note: foundPhrases.length > 0 ? `Remove promotional phrases: ${foundPhrases.join(', ')}` : undefined,
  })

  // Rule: Minimum helpful content length
  const wordCount = draft.content.trim().split(/\s+/).length
  rules.push({
    rule: 'Substantive, helpful content (100+ words)',
    status: wordCount >= 100 ? 'pass' : wordCount >= 60 ? 'warn' : 'fail',
    note: wordCount < 100 ? `Current: ${wordCount} words. Expand with more genuinely helpful information.` : undefined,
  })

  // Rule: Platform-specific link policy
  if (draft.includes_product_link && !platformRules.allowsProductLinks) {
    rules.push({
      rule: `${platformRules.name} generally prohibits product self-promotion`,
      status: 'fail',
      note: 'Remove the product link. Focus on providing value as a community member.',
    })
  } else if (draft.includes_product_link) {
    const linkContextual = draft.product_link_context && draft.product_link_context.length > 10
    rules.push({
      rule: 'Product link is contextually justified',
      status: linkContextual ? 'pass' : 'warn',
      note: linkContextual ? undefined : 'Provide context for why you are linking to this product.',
    })
  }

  // Determine overall status
  const hasFailures = rules.some((r) => r.status === 'fail')
  const hasWarnings = rules.some((r) => r.status === 'warn')
  const overall: ComplianceLevel = hasFailures ? 'fail' : hasWarnings ? 'warn' : 'pass'

  return { platform: draft.platform, overall, rules }
}

// ─── Draft Generator ──────────────────────────────────────────────────────────
// In production this calls the Anthropic Claude API.
// The structure below shows exactly how to plug it in.

interface GenerateDraftOptions {
  opportunity: MarketingOpportunity
  productName?: string
  productDescription?: string
  includeProductLink?: boolean
}

export async function generateDraft(opts: GenerateDraftOptions): Promise<{ title?: string; content: string }> {
  const { opportunity, productName = 'Velour', productDescription = 'a relationship-first dating platform focused on boundaries, trust, and intentional connections', includeProductLink = false } = opts

  // Simulate network delay (replace with real API call)
  await new Promise((r) => setTimeout(r, 1800))

  /*
   * PRODUCTION IMPLEMENTATION — uncomment and configure:
   *
   * import Anthropic from '@anthropic-ai/sdk'
   * const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true })
   *
   * For a server-side approach (recommended), call a Supabase Edge Function:
   * const { data } = await supabase.functions.invoke('generate-marketing-draft', { body: { opportunity, productName, includeProductLink } })
   *
   * The system prompt would be:
   * "You are an expert content writer producing helpful, educational, non-promotional content.
   *  Your goal is to genuinely help the person asking the question.
   *  Write in the natural voice of an experienced practitioner sharing knowledge.
   *  Only mention ${productName} if it is genuinely relevant to the answer and you are asked to.
   *  Never use marketing language. Always disclose affiliation if you mention the product.
   *  Target platform: ${opportunity.platform}"
   */

  const { title, body } = buildTemplateDraft(opportunity, productName, productDescription, includeProductLink)
  return { title, content: body }
}

// ─── Template-based Draft Builders ───────────────────────────────────────────

function buildTemplateDraft(
  opp: MarketingOpportunity,
  productName: string,
  productDescription: string,
  includeProductLink: boolean
): { title?: string; body: string } {
  const platform = opp.platform

  if (platform === 'medium' || opp.opportunity_type === 'article_prompt') {
    return buildArticleDraft(opp, productName, productDescription, includeProductLink)
  }

  if (platform === 'hackernews' || platform === 'devto') {
    return buildTechnicalDraft(opp, productName, includeProductLink)
  }

  return buildQADraft(opp, productName, productDescription, includeProductLink)
}

function buildQADraft(
  opp: MarketingOpportunity,
  productName: string,
  productDescription: string,
  includeProductLink: boolean
): { body: string } {
  const disclosure = includeProductLink
    ? `\n\n*Full disclosure: I work on ${productName} (${productDescription}), so I have a perspective on this — but the advice above stands regardless of any tool you use.*`
    : ''

  const productMention = includeProductLink
    ? `\n\nIf you're actively looking for a platform designed with this in mind, ${productName} was built around exactly these principles — but many of these practices can be applied regardless of what app you use.`
    : ''

  return {
    body: `Great question — this comes up a lot and it's worth thinking through carefully.

The short answer is that the conversation itself is often more valuable than any outcome. When you approach it as a genuine dialogue rather than a negotiation to "win," the whole dynamic shifts.

Here are a few things that have worked well in practice:

**Start from curiosity, not assumptions.** Before sharing your own position, ask questions. What matters most to them? What experiences shaped their view? You'll often find more common ground than you expected.

**Name what you're feeling, not what they're doing wrong.** "I feel anxious when..." lands very differently from "You always...". The first opens a conversation; the second starts a debate.

**Agree on the process before the content.** If you both agree that this is a topic you're willing to revisit regularly as things evolve, it takes pressure off any single conversation.

**Write things down.** It sounds formal, but having something in writing — even just a shared note — removes the "I thought we agreed..." ambiguity later. It also makes revisiting the conversation easier.

The goal isn't to have one perfect conversation and be done. It's to build a habit of checking in, which actually reduces friction over time.${productMention}${disclosure}`,
  }
}

function buildArticleDraft(
  opp: MarketingOpportunity,
  productName: string,
  productDescription: string,
  includeProductLink: boolean
): { title: string; body: string } {
  const productSection = includeProductLink
    ? `\n\n## A Note on Tools\n\nThere are a growing number of platforms trying to design for this. ${productName} — ${productDescription} — is one we've been building with these principles in mind. The landscape is still early, but the direction is encouraging.\n\n*Disclosure: I work on ${productName}.*`
    : ''

  return {
    title: `The Honest Guide to ${opp.title.replace(/^(The |A |An )/i, '')}`,
    body: `Most advice on this topic falls into two camps: either it's too clinical and abstract, or it's too focused on tactics that feel manipulative in practice. This piece tries to chart a different course.

## Why the Conventional Wisdom Falls Short

The standard advice — "communicate more," "be vulnerable," "set clear boundaries" — is true but incomplete. It tells you what to do without telling you how to actually do it in a moment of friction, when the stakes feel high and you're not at your most articulate.

## What Actually Works

**1. Build the muscle before you need it**

The best time to have a difficult conversation is not when you're already in conflict. Couples (and partners of all kinds) who make a habit of brief, low-stakes check-ins handle the big conversations much more gracefully. Five minutes of "how are we doing?" weekly beats a two-hour reckoning quarterly.

**2. Distinguish between positions and interests**

In any disagreement, the stated position ("I want X") usually rests on an underlying interest ("I need to feel Y"). Most conflicts dissolve when you can identify and address the underlying interest — which is often shared — rather than battling over positions.

**3. Use time deliberately**

Give yourself permission to say "I need a few minutes to think about this." The cultural expectation that we should be able to respond to emotionally complex information immediately is neither realistic nor fair. Thoughtful responses consistently outperform reactive ones.

**4. Revisit, don't relitigate**

Agreements aren't permanent. What worked six months ago might need updating. Building in regular, explicit revisits to important agreements removes the stigma from bringing things up again — it's just maintenance, not a sign that something is wrong.

## The Bigger Picture

The irony is that investing in this kind of communication infrastructure feels like extra work but actually reduces friction. The relationships that handle difficulty best aren't the ones without conflict — they're the ones where people trust the process of working through it.${productSection}`,
  }
}

function buildTechnicalDraft(
  opp: MarketingOpportunity,
  productName: string,
  includeProductLink: boolean
): { body: string } {
  const disclosure = includeProductLink
    ? `\n\n> Disclosure: I work on ${productName}, which is in this space, so I have firsthand context on some of the challenges described above.`
    : ''

  return {
    body: `This is an underexplored area — most apps treat it as an afterthought, which explains why the UX for it is so consistently poor.

From a product design perspective, the core challenges are:

**State management complexity.** These preferences aren't binary and they change over time. A simple "yes/no" schema doesn't capture the nuance, but a more expressive schema creates interpretation problems at matching time. Most teams punt on this.

**Privacy by design vs. privacy by policy.** The data involved is sensitive enough that architecture decisions matter at a fundamental level — not just in how you store it but in who can query it and under what conditions. Row-level security in Postgres (e.g., Supabase RLS) makes the policy enforceable at the database level rather than relying on application logic alone.

**The disclosure problem.** Even if a platform captures this data correctly, surfacing it in ways that feel natural rather than clinical is a UX challenge most teams don't spend enough time on.

The teams doing this most thoughtfully seem to have a few things in common: they involve people from the communities they serve in the design process early, they treat consent flows as a product surface (not a legal checkbox), and they err heavily on the side of user control over platform convenience.${disclosure}`,
  }
}
