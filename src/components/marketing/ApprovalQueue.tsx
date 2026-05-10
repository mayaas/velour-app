import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Card, SectionLabel, Textarea, Badge } from '../ui'
import { useMarketingStore } from '../../store/marketing'
import { runComplianceCheck } from '../../lib/ai/marketing'
import type { MarketingDraft, MarketingPlatform } from '../../types/marketing'
import { PLATFORM_RULES } from '../../types/marketing'

const PLATFORM_LABELS: Record<MarketingPlatform, string> = {
  reddit: 'Reddit',
  quora: 'Quora',
  medium: 'Medium',
  linkedin: 'LinkedIn',
  hackernews: 'Hacker News',
  devto: 'DEV.to',
  forum: 'Forum',
}

const ComplianceBadge = ({ level }: { level: 'pass' | 'warn' | 'fail' }) => {
  const styles = {
    pass: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    warn: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    fail: 'text-red-400 border-red-400/30 bg-red-400/5',
  }
  const labels = { pass: 'Compliant', warn: 'Review Needed', fail: 'Non-Compliant' }
  return (
    <span className={clsx('text-[8px] tracking-[0.2em] uppercase border px-2.5 py-1', styles[level])}>
      {labels[level]}
    </span>
  )
}

const DraftEditor = ({ draft, onClose }: { draft: MarketingDraft; onClose: () => void }) => {
  const { updateDraft, approveDraft, rejectDraft } = useMarketingStore()
  const [content, setContent] = useState(draft.content)
  const [title, setTitle] = useState(draft.title ?? '')
  const [includesLink, setIncludesLink] = useState(draft.includes_product_link)
  const [linkContext, setLinkContext] = useState(draft.product_link_context ?? '')
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const liveCompliance = runComplianceCheck({
    content,
    platform: draft.platform,
    includes_product_link: includesLink,
    product_link_context: linkContext,
  })

  const platformRules = PLATFORM_RULES[draft.platform]

  const handleSave = () => {
    setIsSaving(true)
    updateDraft(draft.id, {
      content,
      title: title || undefined,
      includes_product_link: includesLink,
      product_link_context: linkContext || undefined,
      compliance: liveCompliance,
    })
    setTimeout(() => setIsSaving(false), 500)
  }

  const handleApprove = () => {
    handleSave()
    approveDraft(draft.id)
    onClose()
  }

  const handleReject = () => {
    rejectDraft(draft.id, rejectNotes)
    onClose()
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>Draft Editor</SectionLabel>
          <p className="text-sm text-velour-dim font-light truncate max-w-sm">{draft.opportunity.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <ComplianceBadge level={liveCompliance.overall} />
          <button onClick={onClose} className="text-velour-muted hover:text-velour-dim text-sm transition-colors">✕ Close</button>
        </div>
      </div>

      {/* Platform Rules */}
      <div className="border border-[rgba(185,150,90,0.14)] bg-bg-2 px-4 py-3">
        <p className="text-[9px] tracking-[0.2em] uppercase text-rose mb-2">{PLATFORM_LABELS[draft.platform]} Rules</p>
        <ul className="space-y-1">
          {platformRules.rules.map((rule, i) => (
            <li key={i} className="text-[11px] text-velour-muted flex gap-2">
              <span className="text-velour-muted/50 shrink-0">—</span>
              {rule}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-velour-dim mt-2 pt-2 border-t border-[rgba(185,150,90,0.1)]">
          <span className="text-rose">Tone: </span>{platformRules.toneGuidance}
        </p>
      </div>

      {/* Compliance Checklist */}
      <div className="space-y-2">
        <p className="text-[9px] tracking-[0.25em] uppercase text-velour-dim">Live Compliance Check</p>
        {liveCompliance.rules.map((rule, i) => (
          <div key={i} className={clsx('flex items-start gap-3 px-4 py-2.5 border', {
            'border-emerald-400/20 bg-emerald-400/3': rule.status === 'pass',
            'border-amber-400/20 bg-amber-400/3': rule.status === 'warn',
            'border-red-400/20 bg-red-400/3': rule.status === 'fail',
          })}>
            <span className={clsx('shrink-0 text-sm mt-0.5', {
              'text-emerald-400': rule.status === 'pass',
              'text-amber-400': rule.status === 'warn',
              'text-red-400': rule.status === 'fail',
            })}>
              {rule.status === 'pass' ? '✓' : rule.status === 'warn' ? '⚠' : '✗'}
            </span>
            <div>
              <p className="text-[11px] text-velour-dim">{rule.rule}</p>
              {rule.note && <p className="text-[10px] text-velour-muted mt-0.5">{rule.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Title (for article types) */}
      {(draft.opportunity.opportunity_type === 'article_prompt' || draft.platform === 'medium') && (
        <div>
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim block mb-2">Article Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-2 px-4 py-3 text-velour-text text-sm font-light outline-none border border-[rgba(185,150,90,0.18)] focus:border-[rgba(185,150,90,0.5)]"
            placeholder="Article title…"
          />
        </div>
      )}

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim">Draft Content</label>
          <span className="text-[10px] text-velour-muted">{wordCount} words</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full bg-bg-2 px-4 py-3 text-velour-text text-sm font-light outline-none border border-[rgba(185,150,90,0.18)] focus:border-[rgba(185,150,90,0.5)] resize-none leading-relaxed"
        />
      </div>

      {/* Product Link Toggle */}
      <div className="border border-[rgba(185,150,90,0.14)] bg-bg-2 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-velour-dim">Include Product Link</p>
            <p className="text-[10px] text-velour-muted mt-0.5">Only when genuinely relevant to the answer</p>
          </div>
          <button
            onClick={() => setIncludesLink(!includesLink)}
            className={clsx(
              'w-10 h-5 rounded-full transition-all duration-200 relative',
              includesLink ? 'bg-rose' : 'bg-[rgba(185,150,90,0.2)]'
            )}
          >
            <span className={clsx(
              'absolute top-0.5 w-4 h-4 rounded-full bg-velour-text transition-all duration-200',
              includesLink ? 'left-5' : 'left-0.5'
            )} />
          </button>
        </div>
        {includesLink && (
          <Textarea
            label="Why is the link relevant here?"
            placeholder="Explain the specific context in which this product genuinely helps answer the question…"
            value={linkContext}
            onChange={(e) => setLinkContext(e.target.value)}
            rows={2}
          />
        )}
        {includesLink && platformRules.requiresDisclosure && (
          <p className="text-[10px] text-amber-400">
            ⚠ {PLATFORM_LABELS[draft.platform]} requires affiliate disclosure. Make sure the draft includes language like "Full disclosure: I work on…"
          </p>
        )}
      </div>

      {/* Reject Form */}
      {showRejectForm && (
        <div className="border border-red-400/20 bg-red-400/3 px-4 py-4 space-y-3">
          <p className="text-[9px] tracking-[0.2em] uppercase text-red-400">Rejection Notes</p>
          <Textarea
            placeholder="Explain why this draft needs more work…"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleReject} disabled={!rejectNotes.trim()}>
              Confirm Reject
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Action Bar */}
      {draft.status !== 'approved' && draft.status !== 'rejected' && !showRejectForm && (
        <div className="flex items-center gap-3 pt-2 border-t border-[rgba(185,150,90,0.1)]">
          <Button
            onClick={handleApprove}
            disabled={liveCompliance.overall === 'fail'}
            variant="rose"
          >
            Approve Draft
          </Button>
          <Button variant="ghost" onClick={handleSave} loading={isSaving}>
            Save Changes
          </Button>
          <Button variant="danger" onClick={() => setShowRejectForm(true)}>
            Reject
          </Button>
          {liveCompliance.overall === 'fail' && (
            <p className="text-[10px] text-red-400">Fix compliance issues before approving.</p>
          )}
        </div>
      )}

      {(draft.status === 'approved' || draft.status === 'rejected') && (
        <div className={clsx('px-4 py-3 border text-[11px]', draft.status === 'approved' ? 'border-emerald-400/30 text-emerald-400' : 'border-red-400/30 text-red-400')}>
          This draft has been {draft.status}.
          {draft.reviewer_notes && <p className="mt-1 text-velour-muted">Notes: {draft.reviewer_notes}</p>}
        </div>
      )}
    </div>
  )
}

const DraftCard = ({ draft, onSelect }: { draft: MarketingDraft; onSelect: () => void }) => {
  const statusStyles: Record<string, string> = {
    draft: 'text-velour-dim border-[rgba(185,150,90,0.25)]',
    pending_review: 'text-amber-400 border-amber-400/30',
    approved: 'text-emerald-400 border-emerald-400/30',
    rejected: 'text-red-400 border-red-400/30',
    published: 'text-violet-400 border-violet-400/30',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    published: 'Published',
  }

  return (
    <Card hover onClick={onSelect} className="p-4 cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-velour-dim font-light flex-1 min-w-0 line-clamp-2">
          {draft.title || draft.opportunity.title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <ComplianceBadge level={draft.compliance.overall} />
          <span className={clsx('text-[8px] tracking-[0.15em] uppercase border px-2 py-0.5', statusStyles[draft.status])}>
            {statusLabel[draft.status]}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-velour-muted line-clamp-2 mb-3">{draft.content.slice(0, 180)}…</p>
      <div className="flex items-center gap-3">
        <Badge variant="ghost">{PLATFORM_LABELS[draft.platform]}</Badge>
        <span className="text-[10px] text-velour-muted">{new Date(draft.created_at).toLocaleDateString()}</span>
        <span className="text-[10px] text-velour-muted">{draft.content.trim().split(/\s+/).length} words</span>
      </div>
    </Card>
  )
}

export const ApprovalQueue = () => {
  const { drafts } = useMarketingStore()
  const [selectedDraft, setSelectedDraft] = useState<MarketingDraft | null>(null)

  if (selectedDraft) {
    const current = drafts.find((d) => d.id === selectedDraft.id) ?? selectedDraft
    return <DraftEditor draft={current} onClose={() => setSelectedDraft(null)} />
  }

  const pending = drafts.filter((d) => d.status === 'draft' || d.status === 'pending_review')
  const reviewed = drafts.filter((d) => d.status === 'approved' || d.status === 'rejected' || d.status === 'published')

  if (drafts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-velour-muted text-sm mb-2">No drafts yet.</p>
        <p className="text-[11px] text-velour-muted">Discover opportunities and click "Draft Answer" to generate content for review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <SectionLabel>Awaiting Review ({pending.length})</SectionLabel>
          <div className="space-y-3">
            {pending.map((d) => <DraftCard key={d.id} draft={d} onSelect={() => setSelectedDraft(d)} />)}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <SectionLabel>Reviewed ({reviewed.length})</SectionLabel>
          <div className="space-y-3">
            {reviewed.map((d) => <DraftCard key={d.id} draft={d} onSelect={() => setSelectedDraft(d)} />)}
          </div>
        </div>
      )}
    </div>
  )
}
