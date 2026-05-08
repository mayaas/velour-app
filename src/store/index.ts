import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, UserProfile, AppView, Notification } from '../types'
import { supabase } from '../lib/supabase'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (v: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },
    }),
    { name: 'velour-auth', partialize: (s) => ({ user: s.user }) }
  )
)

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  activeView: AppView
  sidebarOpen: boolean
  notifications: Notification[]
  unreadCount: number
  setActiveView: (view: AppView) => void
  toggleSidebar: () => void
  addNotification: (n: Notification) => void
  markAllRead: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'discover',
  sidebarOpen: false,
  notifications: [],
  unreadCount: 0,
  setActiveView: (activeView) => set({ activeView, sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}))

// ─── Discover Store ───────────────────────────────────────────────────────────

interface DiscoverState {
  profiles: UserProfile[]
  currentIndex: number
  likedIds: string[]
  passedIds: string[]
  isLoading: boolean
  setProfiles: (profiles: UserProfile[]) => void
  like: (id: string) => void
  pass: (id: string) => void
  next: () => void
  setLoading: (v: boolean) => void
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  profiles: [],
  currentIndex: 0,
  likedIds: [],
  passedIds: [],
  isLoading: false,
  setProfiles: (profiles) => set({ profiles, currentIndex: 0 }),
  like: (id) => set((s) => ({ likedIds: [...s.likedIds, id], currentIndex: s.currentIndex + 1 })),
  pass: (id) => set((s) => ({ passedIds: [...s.passedIds, id], currentIndex: s.currentIndex + 1 })),
  next: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ─── Boundaries Store ─────────────────────────────────────────────────────────

import type { UserBoundary } from '../types'

interface BoundariesState {
  boundaries: UserBoundary[]
  isDirty: boolean
  setBoundaries: (b: UserBoundary[]) => void
  updateBoundary: (boundaryId: string, level: string, notes?: string) => void
  resetDirty: () => void
}

export const useBoundariesStore = create<BoundariesState>((set) => ({
  boundaries: [],
  isDirty: false,
  setBoundaries: (boundaries) => set({ boundaries, isDirty: false }),
  updateBoundary: (boundaryId, level, notes) =>
    set((s) => ({
      isDirty: true,
      boundaries: s.boundaries.map((b) =>
        b.boundary_id === boundaryId ? { ...b, level: level as UserBoundary['level'], notes } : b
      ),
    })),
  resetDirty: () => set({ isDirty: false }),
}))
