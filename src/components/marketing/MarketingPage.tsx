import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useMarketingStore } from '../../store/marketing'
import { TopicSearch } from './TopicSearch'
import { OpportunitiesList } from './OpportunitiesList'
import { ApprovalQueue } from './ApprovalQueue'
import { PerformanceTracker } from './PerformanceTracker'

const TABS = [
  { id: 'discover' as const, label: 'Discover', desc: 'Find & draft' },
  { id: 'queue' as const, label: 'Review Queue', desc: 'Approve drafts' },
  { id: 'tracker' as const, label: 'Performance', desc: 'Track posts' },
]

export const MarketingPage = () => {
  const { activeTab, setActiveTab, drafts, posts } = useMarketingStore()

  const pendingDrafts = drafts.filter((d) => d.status === 'draft' || d.status === 'pending_review').length
  const approvedUnpublished = drafts.filter((d) => d.status === 'approved').length

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-5 h-px bg-rose opacity-50" />
          <span className="text-rose text-[9px] tracking-[0.38em] uppercase">Organic Marketing</span>
        </div>
        <h1 className="font-serif text-2xl font-light text-velour-text mb-2">
          Content Assistant
        </h1>
        <p className="text-sm text-velour-muted font-light leading-relaxed max-w-lg">
          Find relevant questions and discussions across platforms. Generate genuinely helpful, educational drafts. Every piece requires human review before publishing.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[rgba(185,150,90,0.14)] mb-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const badge = tab.id === 'queue' ? pendingDrafts : tab.id === 'tracker' ? approvedUnpublished : 0
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex flex-col items-start px-5 py-3 relative transition-all duration-200 border-b-2 -mb-px',
                isActive
                  ? 'border-rose text-velour-dim'
                  : 'border-transparent text-velour-muted hover:text-velour-dim'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.18em] uppercase">{tab.label}</span>
                {badge > 0 && (
                  <span className="text-[8px] bg-rose text-bg px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-velour-muted hidden sm:block">{tab.desc}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'discover' && (
            <div className="space-y-10">
              <TopicSearch />
              <OpportunitiesList />
            </div>
          )}
          {activeTab === 'queue' && <ApprovalQueue />}
          {activeTab === 'tracker' && <PerformanceTracker />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
