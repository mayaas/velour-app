import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthPage } from './components/auth/AuthPage'
import { AppShell } from './components/layout/AppShell'
import { DiscoverPage } from './components/matching/DiscoverPage'
import { MatchesPage, MessagesPage } from './components/matching/MatchesAndMessages'
import { ProfilePage } from './components/profile/ProfilePage'
import { AICoachPage } from './components/ai/AICoachPage'
import { CoupleSystemPage } from './components/couple/CoupleSystemPage'
import { MarketingPage } from './components/marketing/MarketingPage'
import { OnboardingPage } from './components/onboarding/OnboardingPage'
import { useAuthStore, useUIStore } from './store'
import { supabase } from './lib/supabase'
import { Spinner } from './components/ui'

const SettingsPage = () => {
  const { logout } = useAuthStore()
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-5 h-px bg-rose opacity-50" />
        <span className="text-rose text-[9px] tracking-[0.38em] uppercase">Settings</span>
      </div>
      <h1 className="font-serif text-2xl font-light text-velour-text mb-8">Account</h1>
      <div className="flex flex-col gap-2">
        {['Notifications','Verification','Privacy & Safety','Subscription','Help & Support'].map((label) => (
          <button key={label} className="flex items-center justify-between px-5 py-4 bg-bg-2 border border-[rgba(185,150,90,0.14)] hover:border-[rgba(185,150,90,0.3)] transition-all text-left">
            <span className="text-sm text-velour-dim">{label}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-4 h-4 text-velour-muted"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
      <button onClick={logout} className="w-full mt-8 py-4 text-[10px] tracking-[0.2em] uppercase text-velour-muted border border-[rgba(185,150,90,0.14)] hover:text-red-400/70 transition-all">Sign Out</button>
    </div>
  )
}

const PageContent = () => {
  const { activeView } = useUIStore()
  const pages: Record<string, React.ReactElement> = {
    discover: <DiscoverPage />,
    matches: <MatchesPage />,
    messages: <MessagesPage />,
    profile: <ProfilePage />,
    coach: <AICoachPage />,
    couple: <CoupleSystemPage />,
    marketing: <MarketingPage />,
    settings: <SettingsPage />,
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
        {pages[activeView] || <DiscoverPage />}
      </motion.div>
    </AnimatePresence>
  )
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
    <div className="font-serif text-3xl font-light text-velour-text tracking-wide">Velour<span className="text-rose">.</span></div>
    <Spinner size="sm" />
  </div>
)

// Preview mode: set VITE_PREVIEW=true to skip auth entirely
const PREVIEW_MODE = import.meta.env.VITE_PREVIEW === 'true'

const MOCK_USER = {
  id: 'preview-user-001',
  email: 'preview@velour.app',
  created_at: new Date().toISOString(),
}

function App() {
  const { user, setUser, setLoading, isLoading } = useAuthStore()
  const { setActiveView } = useUIStore()
  const [onboarded, setOnboarded] = useState(true)

  useEffect(() => {
    if (PREVIEW_MODE) {
      setUser(MOCK_USER)
      setActiveView('marketing')
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email!, created_at: data.session.user.created_at })
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email!, created_at: session.user.created_at })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) return <LoadingScreen />
  if (!user) return <AuthPage />
  if (!onboarded) return <OnboardingPage onComplete={() => setOnboarded(true)} />

  return (
    <AppShell>
      {PREVIEW_MODE && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-400/10 border-b border-amber-400/30 text-center py-1.5 lg:pl-64">
          <span className="text-[9px] tracking-[0.25em] uppercase text-amber-400">Preview Mode — Auth disabled</span>
        </div>
      )}
      <div className={PREVIEW_MODE ? 'pt-7' : ''}>
        <PageContent />
      </div>
    </AppShell>
  )
}

export default App
