export type Platform =
  | 'linkedin'
  | 'reddit'
  | 'quora'
  | 'medium'
  | 'hackernews'
  | 'devto'

export type OpportunityType = 'question' | 'discussion' | 'article'
export type OpportunityStatus = 'new' | 'drafting' | 'drafted' | 'skipped'
export type DraftStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published'
export type ComplianceLevel = 'pass' | 'warn' | 'fail'

export interface Topic {
  id: string
  keyword: string
  platforms: Platform[]
  created_at: string
}

export interface Opportunity {
  id: string
  topic_id: string
  platform: Platform
  title: string
  url: string
  snippet: string
  relevance_score: number
  type: OpportunityType
  author?: string
  upvotes?: number
  replies?: number
  community?: string
  discovered_at: string
  status: OpportunityStatus
}

export interface ComplianceRule {
  label: string
  status: ComplianceLevel
  note?: string
}

export interface ComplianceResult {
  overall: ComplianceLevel
  rules: ComplianceRule[]
}

export interface Draft {
  id: string
  opportunity_id: string
  opportunity: Opportunity
  title?: string
  content: string
  platform: Platform
  compliance: ComplianceResult
  includes_link: boolean
  link_context?: string
  status: DraftStatus
  reviewer_notes?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  draft_id: string
  platform: Platform
  url: string
  published_at: string
  opportunity_title: string
  topic_keyword: string
  views: number
  clicks: number
  upvotes: number
  last_updated: string
}

export type AppView = 'discover' | 'queue' | 'tracker'

export const PLATFORM_META: Record<Platform, { name: string; color: string; bg: string }> = {
  linkedin:   { name: 'LinkedIn',     color: 'text-blue-600',   bg: 'bg-blue-50' },
  reddit:     { name: 'Reddit',       color: 'text-orange-600', bg: 'bg-orange-50' },
  quora:      { name: 'Quora',        color: 'text-red-600',    bg: 'bg-red-50' },
  medium:     { name: 'Medium',       color: 'text-green-700',  bg: 'bg-green-50' },
  hackernews: { name: 'Hacker News',  color: 'text-amber-700',  bg: 'bg-amber-50' },
  devto:      { name: 'DEV.to',       color: 'text-violet-600', bg: 'bg-violet-50' },
}

export const PLATFORM_RULES: Record<Platform, { rules: string[]; disclosure: boolean; toneGuidance: string }> = {
  linkedin: {
    rules: [
      'Professional, thought-leadership tone only',
      'Share genuine expertise — avoid promotional language',
      'Product mention acceptable when professionally relevant',
      'Engage with comments to build credibility',
    ],
    disclosure: false,
    toneGuidance: 'Expert, concise, data-driven. Speak as an AI recruitment practitioner.',
  },
  reddit: {
    rules: [
      'Be a genuine community member, not a brand rep',
      'Read subreddit rules — many ban self-promotion',
      'Answer fully before any product mention',
      'Disclose affiliation clearly if you mention Harmonai',
    ],
    disclosure: true,
    toneGuidance: 'Conversational, humble, community-first. No buzzwords.',
  },
  quora: {
    rules: [
      'Answer must directly address the question',
      'Disclose affiliation if mentioning Harmonai',
      'Provide real value — avoid thin promotional answers',
    ],
    disclosure: true,
    toneGuidance: 'Educational, expert. Lead with knowledge, not product.',
  },
  medium: {
    rules: [
      'Articles must be genuinely informative',
      'Product mention must be contextually relevant',
      'Label any sponsored content clearly',
    ],
    disclosure: false,
    toneGuidance: 'Thoughtful, long-form. Prioritise insight over promotion.',
  },
  hackernews: {
    rules: [
      'Strictly no marketing language',
      'Technically substantive answers only',
      'Disclose if you built what you mention',
      'HN strongly penalises promotional comments',
    ],
    disclosure: true,
    toneGuidance: 'Technical, direct, humble. Show the work, not the pitch.',
  },
  devto: {
    rules: [
      'Developer-focused, practical content',
      'Tutorials and how-tos are highly valued',
      'Product mention must add value to the technical content',
    ],
    disclosure: false,
    toneGuidance: 'Practical, tutorial-style. Code examples where relevant.',
  },
}
