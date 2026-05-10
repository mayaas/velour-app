export type MarketingPlatform =
  | 'reddit'
  | 'quora'
  | 'medium'
  | 'linkedin'
  | 'hackernews'
  | 'devto'
  | 'forum'

export type OpportunityType = 'question' | 'discussion' | 'article_prompt' | 'forum_thread'
export type OpportunityStatus = 'new' | 'drafting' | 'drafted' | 'skipped'
export type DraftStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published'
export type ComplianceLevel = 'pass' | 'warn' | 'fail'

export interface MarketingTopic {
  id: string
  keyword: string
  description?: string
  platforms: MarketingPlatform[]
  created_at: string
}

export interface MarketingOpportunity {
  id: string
  topic_id: string
  platform: MarketingPlatform
  title: string
  url: string
  body_snippet: string
  relevance_score: number
  opportunity_type: OpportunityType
  discovered_at: string
  status: OpportunityStatus
  author?: string
  upvotes?: number
  reply_count?: number
  subreddit?: string
}

export interface ComplianceRule {
  rule: string
  status: ComplianceLevel
  note?: string
}

export interface ComplianceCheck {
  platform: MarketingPlatform
  overall: ComplianceLevel
  rules: ComplianceRule[]
}

export interface MarketingDraft {
  id: string
  opportunity_id: string
  opportunity: MarketingOpportunity
  title?: string
  content: string
  platform: MarketingPlatform
  compliance: ComplianceCheck
  includes_product_link: boolean
  product_link_context?: string
  status: DraftStatus
  reviewer_notes?: string
  created_at: string
  updated_at: string
}

export interface MarketingPost {
  id: string
  draft_id: string
  platform: MarketingPlatform
  post_url: string
  published_at: string
  topic: string
  opportunity_title: string
  views: number
  clicks: number
  upvotes: number
  last_checked_at: string
}

export interface PlatformRule {
  platform: MarketingPlatform
  name: string
  rules: string[]
  allowsProductLinks: boolean
  requiresDisclosure: boolean
  toneGuidance: string
}

export const PLATFORM_RULES: Record<MarketingPlatform, PlatformRule> = {
  reddit: {
    platform: 'reddit',
    name: 'Reddit',
    rules: [
      'Answer the question fully before mentioning any product',
      'Disclose affiliation if you mention your product',
      'Check subreddit rules — many ban self-promotion entirely',
      'Do not post the same answer across multiple subreddits',
      'Be a genuine community member, not a brand representative',
    ],
    allowsProductLinks: true,
    requiresDisclosure: true,
    toneGuidance: 'Casual, conversational, community-first. No marketing language.',
  },
  quora: {
    platform: 'quora',
    name: 'Quora',
    rules: [
      'Answers must directly address the question asked',
      'Disclose any affiliation with products you mention',
      'Provide substantive value — avoid thin promotional answers',
      'Do not use Quora primarily to drive traffic to your site',
    ],
    allowsProductLinks: true,
    requiresDisclosure: true,
    toneGuidance: 'Expert, educational. Lead with genuine expertise.',
  },
  medium: {
    platform: 'medium',
    name: 'Medium',
    rules: [
      'Articles must be genuinely informative and educational',
      'Product mentions must be contextually relevant, not the focus',
      'Follow Medium Partner Program content guidelines',
      'Clearly label any sponsored or affiliate content',
    ],
    allowsProductLinks: true,
    requiresDisclosure: false,
    toneGuidance: 'Thoughtful, long-form. Prioritize insight over promotion.',
  },
  linkedin: {
    platform: 'linkedin',
    name: 'LinkedIn',
    rules: [
      'Maintain a professional, thought-leadership tone',
      'Engagement-bait tactics violate LinkedIn policies',
      'Article content must be original and substantive',
      'Product mentions acceptable when professionally relevant',
    ],
    allowsProductLinks: true,
    requiresDisclosure: false,
    toneGuidance: 'Professional, insightful. Share genuine expertise.',
  },
  hackernews: {
    platform: 'hackernews',
    name: 'Hacker News',
    rules: [
      'Strictly no marketing language or promotional framing',
      'Answers must be technically substantive',
      'Disclose if you built the product you mention',
      'HN community strongly penalizes promotional comments',
    ],
    allowsProductLinks: true,
    requiresDisclosure: true,
    toneGuidance: 'Technical, direct, humble. Let quality speak for itself.',
  },
  devto: {
    platform: 'devto',
    name: 'DEV.to',
    rules: [
      'Articles should genuinely help developers',
      'Tutorials and how-tos are highly valued',
      'Product mentions must add value to the technical content',
      'Follow DEV Community Code of Conduct',
    ],
    allowsProductLinks: true,
    requiresDisclosure: false,
    toneGuidance: 'Developer-friendly, practical, tutorial-focused.',
  },
  forum: {
    platform: 'forum',
    name: 'Niche Forum',
    rules: [
      'Read and follow each forum's specific rules before posting',
      'Build reputation by helping before promoting anything',
      'Check whether the forum allows any product mentions',
      'Never post in forums that explicitly ban self-promotion',
    ],
    allowsProductLinks: false,
    requiresDisclosure: true,
    toneGuidance: 'Community-first. Contribute value before anything else.',
  },
}
