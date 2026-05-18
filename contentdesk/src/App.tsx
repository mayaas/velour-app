import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store'
import { TopicForm } from './components/discover/TopicForm'
import { OpportunityList } from './components/discover/OpportunityList'
import { ApprovalQueue } from './components/queue/ApprovalQueue'
import { PerformanceTracker } from './components/tracker/PerformanceTracker'
import { Settings } from './components/settings/Settings'
import type { AppView } from './types'

const NAV: { id: AppView; label: string; icon: string }[] = [
  { id: 'discover', label: 'Discover',     icon: '🔍' },
  { id: 'queue',    label: 'Review Queue', icon: '✍️' },
  { id: 'tracker',  label: 'Performance',  icon: '📊' },
  { id: 'settings', label: 'Settings',     icon: '⚙️' },
]

function App() {
  const { view, setView, drafts } = useStore()

  const pendingCount  = drafts.filter((d) => d.status === 'draft' || d.status === 'pending_review').length
  const approvedCount = drafts.filter((d) => d.status === 'approved').length

  const badge = (id: AppView) => {
    if (id === 'queue'   && pendingCount  > 0) return pendingCount
    if (id === 'tracker' && approvedCount > 0) return approvedCount
    return null
  }

  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      <header className="bg-white border-b border-ink-5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <span className="font-semibold text-ink text-sm">ContentDesk</span>
            <span className="text-ink-4 text-xs ml-2">by hrmony.ai</span>
          </div>
        </div>

        <nav className="flex gap-1">
          {NAV.map(({ id, label, icon }) => {
            const count = badge(id)
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  view === id ? 'bg-brand-50 text-brand-700' : 'text-ink-3 hover:text-ink hover:bg-surface-2',
                )}
              >
                <span>{icon}</span>
                <span className="hidden sm:block">{label}</span>
                {count !== null && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {view === 'discover' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-ink">Discover Opportunities</h1>
                  <p className="text-sm text-ink-3 mt-1">Find relevant questions and discussions where hrmony.ai’s expertise adds genuine value.</p>
                </div>
                <TopicForm />
                <OpportunityList />
              </div>
            )}

            {view === 'queue' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-ink">Review Queue</h1>
                  <p className="text-sm text-ink-3 mt-1">Review, edit, and approve drafts before publishing. Compliance checks run in real-time.</p>
                </div>
                <ApprovalQueue />
              </div>
            )}

            {view === 'tracker' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-ink">Performance Tracker</h1>
                  <p className="text-sm text-ink-3 mt-1">Track published content. Update stats manually from each platform.</p>
                </div>
                <PerformanceTracker />
              </div>
            )}

            {view === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-ink">Settings</h1>
                  <p className="text-sm text-ink-3 mt-1">Configure publishing integrations.</p>
                </div>
                <Settings />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="text-center py-4 text-xs text-ink-5 border-t border-ink-5 bg-white">
        ContentDesk · hrmony.ai · Private use only
      </footer>
    </div>
  )
}

export default App
