import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Card, Badge, Textarea, Toggle } from '../ui'
import { useStore } from '../../store'
import { checkCompliance } from '../../lib/ai'
import type { Draft } from '../../types'
import { PLATFORM_META, PLATFORM_RULES } from '../../types'

const CompliancePanel = ({ draft }: { draft: Pick<Draft, 'content' | 'platform' | 'includes_link' | 'link_context'> }) => {
  const result = checkCompliance(draft.content, draft.platform, draft.includes_link, draft.link_context)
  return (
    <div className="space-y-1.5">
      {result.rules.map((rule, i) => (
        <div key={i} className={clsx('flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm', {
          'bg-green-50 text-green-800':  rule.status === 'pass',
          'bg-amber-50 text-amber-800':  rule.status === 'warn',
          'bg-red-50   text-red-800':    rule.status === 'fail',
        })}>
          <span className="shrink-0 mt-0.5">
            {rule.status === 'pass' ? '✓' : rule.status === 'warn' ? '⚠' : '✗'}
          </span>
          <div>
            <p className="font-medium text-xs">{rule.label}</p>
            {rule.note && <p className="text-xs opacity-80 mt-0.5">{rule.note}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

const DraftEditor = ({ draft, onClose }: { draft: Draft; onClose: () => void }) => {
  const { updateDraft, approveDraft, rejectDraft } = useStore()
  const [content, setContent]           = useState(draft.content)
  const [title, setTitle]               = useState(draft.title ?? '')
  const [includesLink, setIncludesLink] = useState(draft.includes_link)
  const [linkContext, setLinkContext]   = useState(draft.link_context ?? '')
  const [rejectNote, setRejectNote]     = useState('')
  const [showReject, setShowReject]     = useState(false)

  const liveCompliance = checkCompliance(content, draft.platform, includesLink, linkContext)
  const platformRules  = PLATFORM_RULES[draft.platform]
  const words          = content.trim().split(/\s+/).filter(Boolean).length
  const canApprove     = liveCompliance.overall !== 'fail'

  const save = () => updateDraft(draft.id, { content, title: title || undefined, includes_link: includesLink, link_context: linkContext || undefined, compliance: liveCompliance })

  const handleApprove = () => { save(); approveDraft(draft.id); onClose() }
  const handleReject  = () => { rejectDraft(draft.id, rejectNote); onClose() }

  const meta = PLATFORM_META[draft.platform]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded', meta.bg, meta.color)}>{meta.name}</span>
            {liveCompliance.overall === 'pass'  && <Badge color="green">Compliant</Badge>}
            {liveCompliance.overall === 'warn'  && <Badge color="amber">Review needed</Badge>}
            {liveCompliance.overall === 'fail'  && <Badge color="red">Non-compliant</Badge>}
          </div>
          <p className="text-sm font-medium text-ink line-clamp-2">{draft.opportunity.title}</p>
        </div>
        <button onClick={onClose} className="text-ink-4 hover:text-ink-2 text-sm shrink-0">← Back</button>
      </div>

      <div className="bg-surface-1 rounded-xl p-4 border border-ink-5">
        <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">{meta.name} — Posting Rules</p>
        <ul className="space-y-1">
          {platformRules.rules.map((r, i) => (
            <li key={i} className="text-xs text-ink-3 flex gap-2"><span className="text-ink-5">·</span>{r}</li>
          ))}
        </ul>
        <p className="text-xs text-ink-2 mt-2.5 pt-2.5 border-t border-ink-5">
          <span className="font-medium">Tone: </span>{platformRules.toneGuidance}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">Live Compliance Check</p>
        <CompliancePanel draft={{ content, platform: draft.platform, includes_link: includesLink, link_context: linkContext }} />
      </div>

      {(draft.opportunity.type === 'article' || draft.platform === 'medium') && (
        <div>
          <label className="text-xs font-medium text-ink-3 block mb-1.5">Article Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-ink-5 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="Article title…" />
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-ink-3">Draft Content</label>
          <span className="text-xs text-ink-4">{words} words</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-ink-5 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="bg-surface-1 rounded-xl p-4 border border-ink-5 space-y-3">
        <Toggle on={includesLink} onChange={setIncludesLink} label="Include hrmony.ai link" />
        {includesLink && (
          <>
            <Textarea
              label="Why is the link genuinely relevant here?"
              placeholder="Describe the specific reason hrmony.ai addresses what's being asked…"
              value={linkContext}
              onChange={(e) => setLinkContext(e.target.value)}
              rows={2}
            />
            {platformRules.disclosure && (
              <p className="text-xs text-amber-600">⚠ {meta.name} requires affiliate disclosure. Make sure the draft includes "Full disclosure: I work at hrmony.ai."</p>
            )}
          </>
        )}
      </div>

      {showReject && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
          <p className="text-xs font-semibold text-red-600">Rejection reason</p>
          <Textarea placeholder="What needs to change?" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleReject} disabled={!rejectNote.trim()}>Confirm Reject</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {draft.status !== 'approved' && draft.status !== 'rejected' && !showReject && (
        <div className="flex items-center gap-3 pt-2 border-t border-ink-5">
          <Button onClick={handleApprove} disabled={!canApprove}>Approve</Button>
          <Button variant="secondary" onClick={save}>Save Changes</Button>
          <Button variant="ghost" onClick={() => setShowReject(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50">Reject</Button>
          {!canApprove && <p className="text-xs text-red-500">Fix compliance issues first.</p>}
        </div>
      )}

      {draft.status === 'approved' && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">Approved — ready to publish.</div>
      )}
      {draft.status === 'rejected' && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Rejected.{draft.reviewer_notes && <span className="ml-1">Reason: {draft.reviewer_notes}</span>}
        </div>
      )}
    </div>
  )
}

const statusBadge = (status: Draft['status']) => {
  const map: Record<Draft['status'], [string, Parameters<typeof Badge>[0]['color']]> = {
    draft:          ['Draft',           'gray'],
    pending_review: ['Pending Review',  'blue'],
    approved:       ['Approved',        'green'],
    rejected:       ['Rejected',        'red'],
    published:      ['Published',       'violet'],
  }
  const [label, color] = map[status]
  return <Badge color={color}>{label}</Badge>
}

const complianceBadge = (overall: Draft['compliance']['overall']) => {
  if (overall === 'pass') return <Badge color="green">Compliant</Badge>
  if (overall === 'warn') return <Badge color="amber">Review needed</Badge>
  return <Badge color="red">Issues</Badge>
}

export const ApprovalQueue = () => {
  const { drafts } = useStore()
  const [selected, setSelected] = useState<Draft | null>(null)

  if (selected) {
    const live = drafts.find((d) => d.id === selected.id) ?? selected
    return <DraftEditor draft={live} onClose={() => setSelected(null)} />
  }

  const pending  = drafts.filter((d) => d.status === 'draft' || d.status === 'pending_review')
  const reviewed = drafts.filter((d) => ['approved', 'rejected', 'published'].includes(d.status))

  if (!drafts.length) {
    return (
      <div className="py-20 text-center space-y-2">
        <p className="text-sm font-medium text-ink-3">No drafts yet</p>
        <p className="text-xs text-ink-4">Go to Discover, find an opportunity, and click "Draft Answer".</p>
      </div>
    )
  }

  const DraftRow = ({ d }: { d: Draft }) => {
    const meta = PLATFORM_META[d.platform]
    return (
      <Card onClick={() => setSelected(d)} className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-medium text-ink line-clamp-2 flex-1">{d.title || d.opportunity.title}</p>
          <div className="flex gap-1.5 shrink-0">
            {complianceBadge(d.compliance.overall)}
            {statusBadge(d.status)}
          </div>
        </div>
        <p className="text-xs text-ink-4 line-clamp-2 mb-3">{d.content.slice(0, 160)}…</p>
        <div className="flex items-center gap-2 text-xs text-ink-4">
          <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', meta.bg, meta.color)}>{meta.name}</span>
          <span>{d.content.trim().split(/\s+/).length} words</span>
          <span>{new Date(d.created_at).toLocaleDateString()}</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Awaiting Review ({pending.length})</p>
          <div className="space-y-3">{pending.map((d) => <DraftRow key={d.id} d={d} />)}</div>
        </section>
      )}
      {reviewed.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Reviewed ({reviewed.length})</p>
          <div className="space-y-3">{reviewed.map((d) => <DraftRow key={d.id} d={d} />)}</div>
        </section>
      )}
    </div>
  )
}
