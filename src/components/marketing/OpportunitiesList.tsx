import { clsx } from 'clsx'
import { Badge, Card, SectionLabel, Spinner } from '../ui'
import { useMarketingStore } from '../../store/marketing'
import { generateDraft, runComplianceCheck } from '../../lib/ai/marketing'
import type { MarketingDraft, MarketingOpportunity, MarketingPlatform } from '../../types/marketing'

const PLATFORM_COLORS: Record<MarketingPlatform, string> = {
  reddit: 'text-orange-400 border-orange-400/30',
  quora: 'text-red-400 border-red-400/30',
  medium: 'text-emerald-400 border-emerald-400/30',
  linkedin: 'text-blue-400 border-blue-400/30',
  hackernews: 'text-amber-400 border-amber-400/30',
  devto: 'text-violet-400 border-violet-400/30',
  forum: 'text-velour-dim border-[rgba(185,150,90,0.3)]',
}

const PLATFORM_LABELS: Record<MarketingPlatform, string> = {
  reddit: 'Reddit',
  quora: 'Quora',
  medium: 'Medium',
  linkedin: 'LinkedIn',
  hackernews: 'Hacker News',
  devto: 'DEV.to',
  forum: 'Forum',
}

const TYPE_LABELS: Record<MarketingOpportunity['opportunity_type'], string> = {
  question: 'Question',
  discussion: 'Discussion',
  article_prompt: 'Article',
  forum_thread: 'Thread',
}

const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px bg-[rgba(185,150,90,0.1)]">
      <div
        className={clsx(
          'h-full transition-all duration-500',
          score >= 0.7 ? 'bg-emerald-400' : score >= 0.45 ? 'bg-rose' : 'bg-velour-muted'
        )}
        style={{ width: `${score * 100}%` }}
      />
    </div>
    <span className="text-[10px] text-velour-muted w-8 text-right">{Math.round(score * 100)}%</span>
  </div>
)

const OpportunityCard = ({ opp }: { opp: MarketingOpportunity }) => {
  const { addDraft, setIsGenerating, isGenerating, updateOpportunityStatus, setActiveTab } = useMarketingStore()
  const isDrafting = isGenerating

  const handleGenerateDraft = async () => {
    setIsGenerating(true)
    updateOpportunityStatus(opp.id, 'drafting')
    try {
      const result = await generateDraft({ opportunity: opp, includeProductLink: false })
      const compliance = runComplianceCheck({
        content: result.content,
        platform: opp.platform,
        includes_product_link: false,
        product_link_context: undefined,
      })
      const draft: MarketingDraft = {
        id: crypto.randomUUID(),
        opportunity_id: opp.id,
        opportunity: opp,
        title: result.title,
        content: result.content,
        platform: opp.platform,
        compliance,
        includes_product_link: false,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addDraft(draft)
      updateOpportunityStatus(opp.id, 'drafted')
      setActiveTab('queue')
    } finally {
      setIsGenerating(false)
    }
  }

  const statusColors: Record<MarketingOpportunity['status'], string> = {
    new: 'text-velour-dim border-[rgba(185,150,90,0.2)]',
    drafting: 'text-amber-400 border-amber-400/30',
    drafted: 'text-emerald-400 border-emerald-400/30',
    skipped: 'text-velour-muted border-[rgba(185,150,90,0.1)]',
  }

  return (
    <Card hover className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={clsx('text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5', PLATFORM_COLORS[opp.platform])}>
              {PLATFORM_LABELS[opp.platform]}
            </span>
            <span className="text-[8px] tracking-[0.15em] uppercase text-velour-muted border border-[rgba(185,150,90,0.14)] px-2 py-0.5">
              {TYPE_LABELS[opp.opportunity_type]}
            </span>
            {opp.subreddit && (
              <span className="text-[8px] text-velour-muted">r/{opp.subreddit}</span>
            )}
          </div>
          <p className="text-sm text-velour-dim font-light leading-snug">{opp.title}</p>
        </div>
        <span className={clsx('text-[8px] tracking-[0.15em] uppercase border px-2 py-0.5 shrink-0', statusColors[opp.status])}>
          {opp.status}
        </span>
      </div>

      {/* Snippet */}
      <p className="text-[11px] text-velour-muted leading-relaxed line-clamp-2">{opp.body_snippet}</p>

      {/* Relevance score */}
      <div>
        <p className="text-[9px] tracking-[0.2em] uppercase text-velour-muted mb-1.5">Relevance</p>
        <ScoreBar score={opp.relevance_score} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {opp.upvotes !== undefined && (
            <span className="text-[10px] text-velour-muted">↑ {opp.upvotes.toLocaleString()}</span>
          )}
          {opp.reply_count !== undefined && (
            <span className="text-[10px] text-velour-muted">💬 {opp.reply_count}</span>
          )}
          <span className="text-[10px] text-velour-muted">
            {new Date(opp.discovered_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-[0.15em] uppercase text-velour-muted hover:text-rose-light transition-colors border border-[rgba(185,150,90,0.14)] px-3 py-1.5"
          >
            View
          </a>
          {opp.status !== 'drafted' && opp.status !== 'skipped' && (
            <button
              onClick={handleGenerateDraft}
              disabled={isDrafting}
              className="text-[9px] tracking-[0.15em] uppercase text-rose border border-[rgba(201,160,122,0.35)] px-3 py-1.5 hover:bg-[rgba(201,160,122,0.06)] transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {isDrafting && opp.status === 'drafting' ? (
                <><Spinner size="sm" />Generating</>
              ) : 'Draft Answer'}
            </button>
          )}
          {opp.status === 'drafted' && (
            <span className="text-[9px] tracking-[0.15em] uppercase text-emerald-400 border border-emerald-400/30 px-3 py-1.5">
              Drafted ✓
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export const OpportunitiesList = () => {
  const { opportunities, isDiscovering, discoveryError, activeTopic } = useMarketingStore()

  if (isDiscovering) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-velour-muted text-sm">Scanning platforms for opportunities…</p>
      </div>
    )
  }

  if (discoveryError) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-400/70 text-sm">{discoveryError}</p>
      </div>
    )
  }

  if (!activeTopic) {
    return (
      <div className="py-16 text-center">
        <p className="text-velour-muted text-sm">Enter a topic above and click Discover to find opportunities.</p>
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-velour-muted text-sm">No opportunities found for this topic. Try different keywords or platforms.</p>
      </div>
    )
  }

  const highRelevance = opportunities.filter((o) => o.relevance_score >= 0.7)
  const medRelevance = opportunities.filter((o) => o.relevance_score >= 0.45 && o.relevance_score < 0.7)
  const lowRelevance = opportunities.filter((o) => o.relevance_score < 0.45)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionLabel>
          {opportunities.length} Opportunities — "{activeTopic.keyword}"
        </SectionLabel>
        <div className="flex gap-3">
          <Badge variant="verified">{highRelevance.length} High</Badge>
          <Badge variant="rose">{medRelevance.length} Medium</Badge>
          <Badge variant="ghost">{lowRelevance.length} Low</Badge>
        </div>
      </div>

      {highRelevance.length > 0 && (
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-emerald-400 mb-3">High Relevance</p>
          <div className="space-y-3">
            {highRelevance.map((opp) => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        </div>
      )}

      {medRelevance.length > 0 && (
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-rose mb-3">Medium Relevance</p>
          <div className="space-y-3">
            {medRelevance.map((opp) => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        </div>
      )}

      {lowRelevance.length > 0 && (
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-velour-muted mb-3">Lower Relevance</p>
          <div className="space-y-3">
            {lowRelevance.map((opp) => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        </div>
      )}
    </div>
  )
}
