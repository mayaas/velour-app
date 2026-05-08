export type TrustLevel = 'basic' | 'verified' | 'community_verified' | 'premium_verified'
export type RelationshipType = 'single' | 'couple' | 'poly' | 'open'
export type Gender = 'man' | 'woman' | 'non_binary' | 'other' | 'prefer_not'
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized'
export type DynamicRole = 'dominant' | 'submissive' | 'switch' | 'none'
export type ExplorationLevel = 1 | 2 | 3 | 4 | 5

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  age?: number
  gender?: Gender
  location_city?: string
  location_country?: string
  bio?: string
  tagline?: string
  avatar_url?: string
  photos: string[]
  trust_level: TrustLevel
  relationship_type: RelationshipType
  is_couple_profile: boolean
  couple_partner_id?: string
  attachment_style?: AttachmentStyle
  dynamic_role?: DynamicRole
  exploration_level?: ExplorationLevel
  is_stealth: boolean
  is_hidden: boolean
  show_online_status: boolean
  created_at: string
  updated_at: string
}

export type BoundaryLevel = 'hard_no' | 'soft_no' | 'maybe' | 'open_to' | 'enthusiastic_yes'

export interface BoundaryCategory {
  id: string
  category: string
  label: string
  description?: string
}

export interface UserBoundary {
  id: string
  user_id: string
  boundary_id: string
  level: BoundaryLevel
  notes?: string
}

export interface ConsentAgreement {
  id: string
  user_id_a: string
  user_id_b: string
  agreed_boundaries: string[]
  notes?: string
  signed_at: string
  expires_at?: string
}

export type MatchStatus = 'pending' | 'matched' | 'declined' | 'blocked'

export interface Match {
  id: string
  user_id_a: string
  user_id_b: string
  status: MatchStatus
  compatibility_score: number
  compatibility_breakdown: CompatibilityBreakdown
  initiated_by: string
  created_at: string
}

export interface CompatibilityBreakdown {
  emotional: number
  communication: number
  exploration: number
  dynamic: number
  boundaries: number
  values: number
  overall: number
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'expired'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  media_url?: string
  expires_at?: string
  status: MessageStatus
  created_at: string
}

export interface Conversation {
  id: string
  participant_ids: string[]
  last_message?: Message
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  communication_score: number
  respect_score: number
  safety_score: number
  honesty_score: number
  boundaries_score: number
  overall_score: number
  is_anonymous: boolean
  created_at: string
}

export interface ReputationSummary {
  user_id: string
  average_score: number
  total_reviews: number
  breakdown: {
    communication: number
    respect: number
    safety: number
    honesty: number
    boundaries: number
  }
  red_flags: number
  trust_badges: string[]
}

export interface CoupleProfile {
  id: string
  partner_a_id: string
  partner_b_id: string
  display_name: string
  bio?: string
  avatar_url?: string
  permissions: CouplePermissions
  created_at: string
}

export interface CouplePermissions {
  who_can_initiate: 'both' | 'partner_a' | 'partner_b' | 'either_with_approval'
  requires_dual_approval: boolean
  shared_inbox: boolean
  visibility: 'both_required' | 'either_can_browse'
}

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface Notification {
  id: string
  type: 'match' | 'message' | 'review' | 'system' | 'boundary_request'
  title: string
  body: string
  read: boolean
  created_at: string
}

export type AppView = 'discover' | 'matches' | 'messages' | 'profile' | 'settings' | 'coach' | 'couple'
