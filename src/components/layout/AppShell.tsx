import React from 'react'
import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useUIStore, useAuthStore } from '../../store'
import { Avatar, Badge } from '../ui'
import type { AppView } from '../../types'

// Icons (simple SVG)
const icons = {
  discover: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  matches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const navItems: { view: AppView; label: string }[] = [
  { view: 'discover', label: 'Discover' },
  { view: 'matches', label: 'Matches' },
  { view: 'messages', label: 'Messages' },
  { view: 'profile', label: 'Profile' },
]

// ─── Bottom Nav (mobile) ──────────────────────────────────────────────────────

const BottomNav = () => {
  const { activeView, setActiveView } = useUIStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                    bg-bg-2/95 backdrop-blur-md
                    border-t border-[rgba(185,150,90,0.14)]
                    safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map(({ view, label }) => {
          const active = activeView === view
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200',
                active ? 'text-rose' : 'text-velour-muted'
              )}
            >
              {(icons as Record<string, React.ReactNode>)[view] ?? icons.discover}
              <span className="text-[8px] tracking-[0.15em] uppercase">{label}</span>
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="w-1 h-1 bg-rose rounded-full mt-0.5"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────

const Sidebar = () => {
  const { activeView, setActiveView } = useUIStore()
  const { profile, logout } = useAuthStore()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[rgba(185,150,90,0.14)] bg-bg-2 fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-8 py-7 border-b border-[rgba(185,150,90,0.1)]">
        <span className="font-serif text-2xl font-light text-velour-text tracking-wide">
          Velour<span className="text-rose">.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4">
        {navItems.map(({ view, label }) => {
          const active = activeView === view
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 mb-1 text-left transition-all duration-200',
                active
                  ? 'bg-[rgba(201,160,122,0.08)] text-rose border-l-2 border-rose'
                  : 'text-velour-muted hover:text-velour-dim border-l-2 border-transparent'
              )}
            >
              {(icons as Record<string, React.ReactNode>)[view] ?? icons.discover}
              <span className="text-[10px] tracking-[0.2em] uppercase">{label}</span>
            </button>
          )
        })}

        <div className="mt-4 border-t border-[rgba(185,150,90,0.1)] pt-4">
          <button
            onClick={() => setActiveView('settings')}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
              activeView === 'settings'
                ? 'text-rose border-l-2 border-rose'
                : 'text-velour-muted hover:text-velour-dim border-l-2 border-transparent'
            )}
          >
            {icons.settings}
            <span className="text-[10px] tracking-[0.2em] uppercase">Settings</span>
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 pb-6 border-t border-[rgba(185,150,90,0.1)] pt-4">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar src={profile?.avatar_url} name={profile?.display_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-velour-dim text-xs truncate">
              {profile?.display_name || 'Your Profile'}
            </p>
            {profile?.trust_level && (
              <Badge variant={profile.trust_level === 'premium_verified' ? 'premium' : 'verified'}>
                {profile.trust_level.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-center text-velour-muted text-[9px] tracking-[0.2em] uppercase mt-2 py-2 hover:text-rose-dim transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-bg">
    <Sidebar />
    <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
      {children}
    </main>
    <BottomNav />
  </div>
)
