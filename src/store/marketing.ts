import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MarketingTopic,
  MarketingOpportunity,
  MarketingDraft,
  MarketingPost,
  DraftStatus,
} from '../types/marketing'

interface MarketingState {
  // Topics
  topics: MarketingTopic[]
  activeTopic: MarketingTopic | null

  // Opportunities discovered for active topic
  opportunities: MarketingOpportunity[]
  isDiscovering: boolean
  discoveryError: string | null

  // Drafts
  drafts: MarketingDraft[]
  activeDraft: MarketingDraft | null
  isGenerating: boolean

  // Published posts / performance
  posts: MarketingPost[]

  // Active tab in the UI
  activeTab: 'discover' | 'queue' | 'tracker'

  // Actions
  setActiveTab: (tab: MarketingState['activeTab']) => void
  addTopic: (topic: MarketingTopic) => void
  removeTopic: (id: string) => void
  setActiveTopic: (topic: MarketingTopic | null) => void
  setOpportunities: (opps: MarketingOpportunity[]) => void
  setIsDiscovering: (v: boolean) => void
  setDiscoveryError: (err: string | null) => void
  updateOpportunityStatus: (id: string, status: MarketingOpportunity['status']) => void
  addDraft: (draft: MarketingDraft) => void
  updateDraft: (id: string, updates: Partial<MarketingDraft>) => void
  setActiveDraft: (draft: MarketingDraft | null) => void
  setIsGenerating: (v: boolean) => void
  approveDraft: (id: string) => void
  rejectDraft: (id: string, notes: string) => void
  publishDraft: (id: string, postUrl: string) => void
  updatePostStats: (id: string, stats: Partial<Pick<MarketingPost, 'views' | 'clicks' | 'upvotes'>>) => void
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      topics: [],
      activeTopic: null,
      opportunities: [],
      isDiscovering: false,
      discoveryError: null,
      drafts: [],
      activeDraft: null,
      isGenerating: false,
      posts: [],
      activeTab: 'discover',

      setActiveTab: (tab) => set({ activeTab: tab }),

      addTopic: (topic) => set((s) => ({ topics: [topic, ...s.topics] })),

      removeTopic: (id) =>
        set((s) => ({
          topics: s.topics.filter((t) => t.id !== id),
          activeTopic: s.activeTopic?.id === id ? null : s.activeTopic,
          opportunities: s.activeTopic?.id === id ? [] : s.opportunities,
        })),

      setActiveTopic: (topic) => set({ activeTopic: topic, opportunities: [], discoveryError: null }),

      setOpportunities: (opportunities) => set({ opportunities }),

      setIsDiscovering: (isDiscovering) => set({ isDiscovering }),

      setDiscoveryError: (discoveryError) => set({ discoveryError }),

      updateOpportunityStatus: (id, status) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      addDraft: (draft) =>
        set((s) => ({
          drafts: [draft, ...s.drafts],
          activeDraft: draft,
        })),

      updateDraft: (id, updates) =>
        set((s) => ({
          drafts: s.drafts.map((d) =>
            d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
          ),
          activeDraft:
            s.activeDraft?.id === id
              ? { ...s.activeDraft, ...updates, updated_at: new Date().toISOString() }
              : s.activeDraft,
        })),

      setActiveDraft: (activeDraft) => set({ activeDraft }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      approveDraft: (id) => {
        const { updateDraft, opportunities, updateOpportunityStatus } = get()
        const draft = get().drafts.find((d) => d.id === id)
        updateDraft(id, { status: 'approved' as DraftStatus })
        if (draft) {
          const opp = opportunities.find((o) => o.id === draft.opportunity_id)
          if (opp) updateOpportunityStatus(opp.id, 'drafted')
        }
      },

      rejectDraft: (id, notes) => {
        get().updateDraft(id, { status: 'rejected' as DraftStatus, reviewer_notes: notes })
      },

      publishDraft: (id, postUrl) => {
        const { updateDraft, drafts } = get()
        const draft = drafts.find((d) => d.id === id)
        if (!draft) return
        updateDraft(id, { status: 'published' as DraftStatus })
        const post: MarketingPost = {
          id: crypto.randomUUID(),
          draft_id: id,
          platform: draft.platform,
          post_url: postUrl,
          published_at: new Date().toISOString(),
          topic: draft.opportunity.title,
          opportunity_title: draft.opportunity.title,
          views: 0,
          clicks: 0,
          upvotes: 0,
          last_checked_at: new Date().toISOString(),
        }
        set((s) => ({ posts: [post, ...s.posts] }))
      },

      updatePostStats: (id, stats) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, ...stats, last_checked_at: new Date().toISOString() } : p
          ),
        })),
    }),
    {
      name: 'velour-marketing',
      partialize: (s) => ({
        topics: s.topics,
        drafts: s.drafts,
        posts: s.posts,
      }),
    }
  )
)
