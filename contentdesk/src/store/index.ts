import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Topic, Opportunity, Draft, Post, AppView, DraftStatus } from '../types'

interface AppState {
  view: AppView
  topics: Topic[]
  activeTopic: Topic | null
  opportunities: Opportunity[]
  isDiscovering: boolean
  drafts: Draft[]
  activeDraft: Draft | null
  isGenerating: boolean
  posts: Post[]

  setView: (v: AppView) => void
  addTopic: (t: Topic) => void
  removeTopic: (id: string) => void
  setActiveTopic: (t: Topic | null) => void
  setOpportunities: (o: Opportunity[]) => void
  setIsDiscovering: (v: boolean) => void
  updateOpportunityStatus: (id: string, s: Opportunity['status']) => void
  addDraft: (d: Draft) => void
  updateDraft: (id: string, patch: Partial<Draft>) => void
  setActiveDraft: (d: Draft | null) => void
  setIsGenerating: (v: boolean) => void
  approveDraft: (id: string) => void
  rejectDraft: (id: string, notes: string) => void
  publishDraft: (id: string, url: string) => void
  updatePostStats: (id: string, stats: Partial<Pick<Post, 'views' | 'clicks' | 'upvotes'>>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'discover',
      topics: [],
      activeTopic: null,
      opportunities: [],
      isDiscovering: false,
      drafts: [],
      activeDraft: null,
      isGenerating: false,
      posts: [],

      setView: (view) => set({ view }),

      addTopic: (t) => set((s) => ({ topics: [t, ...s.topics] })),

      removeTopic: (id) =>
        set((s) => ({
          topics: s.topics.filter((t) => t.id !== id),
          activeTopic: s.activeTopic?.id === id ? null : s.activeTopic,
          opportunities: s.activeTopic?.id === id ? [] : s.opportunities,
        })),

      setActiveTopic: (activeTopic) => set({ activeTopic, opportunities: [] }),

      setOpportunities: (opportunities) => set({ opportunities }),

      setIsDiscovering: (isDiscovering) => set({ isDiscovering }),

      updateOpportunityStatus: (id, status) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) => o.id === id ? { ...o, status } : o),
        })),

      addDraft: (d) => set((s) => ({ drafts: [d, ...s.drafts], activeDraft: d })),

      updateDraft: (id, patch) =>
        set((s) => ({
          drafts: s.drafts.map((d) => d.id === id ? { ...d, ...patch, updated_at: new Date().toISOString() } : d),
          activeDraft: s.activeDraft?.id === id ? { ...s.activeDraft, ...patch, updated_at: new Date().toISOString() } : s.activeDraft,
        })),

      setActiveDraft: (activeDraft) => set({ activeDraft }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      approveDraft: (id) => {
        get().updateDraft(id, { status: 'approved' as DraftStatus })
        const draft = get().drafts.find((d) => d.id === id)
        if (draft) get().updateOpportunityStatus(draft.opportunity_id, 'drafted')
      },

      rejectDraft: (id, notes) =>
        get().updateDraft(id, { status: 'rejected' as DraftStatus, reviewer_notes: notes }),

      publishDraft: (id, url) => {
        get().updateDraft(id, { status: 'published' as DraftStatus })
        const draft = get().drafts.find((d) => d.id === id)
        if (!draft) return
        const post: Post = {
          id: crypto.randomUUID(),
          draft_id: id,
          platform: draft.platform,
          url,
          published_at: new Date().toISOString(),
          opportunity_title: draft.opportunity.title,
          topic_keyword: draft.opportunity.title,
          views: 0, clicks: 0, upvotes: 0,
          last_updated: new Date().toISOString(),
        }
        set((s) => ({ posts: [post, ...s.posts] }))
      },

      updatePostStats: (id, stats) =>
        set((s) => ({
          posts: s.posts.map((p) => p.id === id ? { ...p, ...stats, last_updated: new Date().toISOString() } : p),
        })),
    }),
    {
      name: 'contentdesk-v1',
      partialize: (s) => ({ topics: s.topics, drafts: s.drafts, posts: s.posts }),
    }
  )
)
