import { clsx } from 'clsx'
import { Card, Badge, Spinner } from '../ui'
import { useStore } from '../../store'
import { generateDraft, checkCompliance } from '../../lib/ai'
import type { Draft, Opportunity } from '../../types'
import { PLATFORM_META } from '../../types'

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const RelevanceBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all', score >= 0.7 ? 'bg-green-500' : score >= 0.45 ? 'bg-amber-400' : 'bg-ink-5')}
        style={{ width: `${score * 100}%` }}
      />
    </div>
    <span className="text-xs text-ink-4 w-7 text-right">{Math.round(score * 100)}%</span>
  </div>
)

const OpportunityCard = ({ opp }: { opp: Opportunity }) => {
  const { addDraft, setIsGenerating, isGenerating, updateOpportunityStatus, setView } = useStore()
  const meta = PLATFORM_META[opp.platform]

  const handleDraft = async () => {
    setIsGenerating(true)
    updateOpportunityStatus(opp.id, 'drafting')
    try {
      const result = await generateDraft(opp, true)
      const linkContext = 'hrmony.ai is an AI recruitment platform — directly relevant to this question.'
      const compliance = checkCompliance(result.content, opp.platform, true, linkContext)
      const draft: Draft = {
        id: crypto.randomUUID(),
        opportunity_id: opp.id,
        opportunity: opp,
        title: result.title,
        content: result.content,
        platform: opp.platform,
        compliance,
        includes_link: true,
        link_context: linkContext,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addDraft(draft)
      updateOpportunityStatus(opp.id, 'drafted')
      setView('queue')
    } finally {
      setIsGenerating(false)
    }
  }

  const isDrafting = isGenerating && opp.status === 'drafting'

  return (
    <Card className="p-4">
      {/* Platform + type */}
      <div className="flex items-center gap-2 mb-2">
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded', meta.bg, meta.color)}>
          {meta.name}
        </span>
        <span className="text-xs text-ink-4 capitalize">{opp.type}</span>
        {opp.community && <span className="text-xs text-ink-4">r/{opp.community}</span>}
        {opp.status === 'drafted' && <Badge color="green">Drafted ✓</Badge>}
        {opp.status === 'drafting' && <Badge color="blue">Generating…</Badge>}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-ink leading-snug mb-1.5">{opp.title}</p>

      {/* Snippet */}
      <p className="text-xs text-ink-3 leading-relaxed line-clamp-2 mb-3">{opp.snippet}</p>

      {/* Relevance */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-ink-4">Relevance</span>
        </div>
        <RelevanceBar score={opp.relevance_score} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-ink-4">
          {opp.posted_at && <span>📅 {relativeDate(opp.posted_at)}</span>}
          {opp.upvotes !== undefined && <span>↑ {opp.upvotes.toLocaleString()}</span>}
          {opp.replies !== undefined && <span>💬 {opp.replies}</span>}
        </div>
        <div className="flex gap-2">
          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-3 hover:text-brand-600 transition-colors px-2.5 py-1 rounded border border-ink-5 hover:border-brand-400"
          >
            View
          </a>
          {opp.status === 'new' && (
            <button
              onClick={handleDraft}
              disabled={isGenerating}
              className="text-xs font-medium px-2.5 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 flex items-center gap-1.5 transition-all"
            >
              {isDrafting ? <><Spinner className="w-3 h-3" /> Generating</> : 'Draft Answer'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export const OpportunityList = () => {
  const { opportunities, isDiscovering, activeTopic } = useStore()

  if (isDiscovering) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-ink-3">Scanning platforms…</p>
      </div>
    )
  }

  if (!activeTopic) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-4">Enter a topic above to discover opportunities.</p>
      </div>
    )
  }

  if (!opportunities.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-ink-4">No opportunities found. Try different keywords or platforms.</p>
      </div>
    )
  }

  const high = opportunities.filter((o) => o.relevance_score >= 0.7)
  const mid  = opportunities.filter((o) => o.relevance_score >= 0.45 && o.relevance_score < 0.7)
  const low  = opportunities.filter((o) => o.relevance_score < 0.45)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">
          {opportunities.length} opportunities for "<span className="text-brand-600">{activeTopic.keyword}</span>"
        </p>
        <div className="flex gap-2">
          <Badge color="green">{high.length} High</Badge>
          <Badge color="amber">{mid.length} Medium</Badge>
          <Badge color="gray">{low.length} Low</Badge>
        </div>
      </div>

      {high.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">High relevance</p>
          <div className="space-y-3">{high.map((o) => <OpportunityCard key={o.id} opp={o} />)}</div>
        </section>
      )}
      {mid.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Medium relevance</p>
          <div className="space-y-3">{mid.map((o) => <OpportunityCard key={o.id} opp={o} />)}</div>
        </section>
      )}
      {low.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-wide mb-2">Lower relevance</p>
          <div className="space-y-3">{low.map((o) => <OpportunityCard key={o.id} opp={o} />)}</div>
        </section>
      )}
    </div>
  )
}
