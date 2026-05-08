import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Button, SectionLabel, Spinner } from '../ui'
import type { BoundaryLevel } from '../../types'

// ─── Boundary categories (hardcoded for MVP) ──────────────────────────────────

const BOUNDARY_CATEGORIES = [
  {
    id: 'physical',
    label: 'Physical',
    icon: '◈',
    items: [
      { id: 'kissing', label: 'Kissing' },
      { id: 'touching', label: 'Touch & Affection' },
      { id: 'intimacy', label: 'Physical Intimacy' },
      { id: 'bdsm_light', label: 'Soft Kink / Light BDSM' },
      { id: 'group', label: 'Group Dynamics' },
    ],
  },
  {
    id: 'emotional',
    label: 'Emotional',
    icon: '◇',
    items: [
      { id: 'emotional_depth', label: 'Emotional Depth' },
      { id: 'vulnerability', label: 'Vulnerability & Sharing' },
      { id: 'attachment', label: 'Attachment & Bonding' },
      { id: 'jealousy', label: 'Navigating Jealousy Together' },
      { id: 'meeting_friends', label: 'Meeting Friends / Social Circle' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: '⊕',
    items: [
      { id: 'frequency', label: 'Daily Communication' },
      { id: 'calls', label: 'Video / Voice Calls' },
      { id: 'media', label: 'Sharing Photos / Media' },
      { id: 'check_ins', label: 'Regular Check-ins' },
      { id: 'transparency', label: 'Full Transparency' },
    ],
  },
  {
    id: 'dynamics',
    label: 'Dynamics',
    icon: '◉',
    items: [
      { id: 'dom_sub', label: 'Dominance / Submission' },
      { id: 'role_play', label: 'Role Dynamics' },
      { id: 'power_exchange', label: 'Power Exchange' },
      { id: 'protocols', label: 'Protocols & Rules' },
      { id: 'collaring', label: 'Collaring / Formal Agreements' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: '◎',
    items: [
      { id: 'discretion', label: 'Full Discretion Required' },
      { id: 'location', label: 'Sharing Location' },
      { id: 'identity', label: 'Identity Disclosure' },
      { id: 'social_media', label: 'Social Media Presence' },
      { id: 'third_party', label: 'Involving Third Parties' },
    ],
  },
]

// ─── Level config ─────────────────────────────────────────────────────────────

const LEVELS: { value: BoundaryLevel; label: string; color: string; short: string }[] = [
  { value: 'hard_no', label: 'Hard No', short: 'No', color: 'border-red-400/40 text-red-400 bg-red-400/5' },
  { value: 'soft_no', label: 'Not for me', short: '–', color: 'border-orange-400/40 text-orange-400 bg-orange-400/5' },
  { value: 'maybe', label: 'Open to discuss', short: '?', color: 'border-yellow-400/40 text-yellow-500 bg-yellow-400/5' },
  { value: 'open_to', label: 'Open to', short: '✓', color: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/5' },
  { value: 'enthusiastic_yes', label: 'Yes!', short: '♥', color: 'border-rose/60 text-rose bg-rose/5' },
]

// ─── Single boundary item ─────────────────────────────────────────────────────

const BoundaryItem = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: BoundaryLevel | null
  onChange: (id: string, level: BoundaryLevel) => void
}) => {
  return (
    <div className="py-3 border-b border-[rgba(185,150,90,0.1)] last:border-0">
      <p className="text-sm text-velour-dim mb-3">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(id, level.value)}
            className={clsx(
              'px-3 py-1.5 text-[9px] tracking-[0.1em] uppercase border transition-all duration-200',
              value === level.value
                ? level.color + ' font-medium'
                : 'border-[rgba(185,150,90,0.15)] text-velour-muted hover:border-[rgba(185,150,90,0.35)]'
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Category Panel ───────────────────────────────────────────────────────────

const CategoryPanel = ({
  category,
  boundaries,
  onUpdate,
}: {
  category: typeof BOUNDARY_CATEGORIES[0]
  boundaries: Record<string, BoundaryLevel>
  onUpdate: (id: string, level: BoundaryLevel) => void
}) => {
  const setCount = category.items.filter((i) => boundaries[i.id]).length
  const totalCount = category.items.length

  return (
    <div className="bg-bg-2 border border-[rgba(185,150,90,0.14)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(185,150,90,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-rose text-lg opacity-60">{category.icon}</span>
            <span className="font-serif text-lg font-light text-velour-text">{category.label}</span>
          </div>
          <span className="text-[9px] tracking-[0.1em] text-velour-muted">
            {setCount}/{totalCount}
          </span>
        </div>
        {/* Progress */}
        <div className="mt-3 h-px bg-[rgba(185,150,90,0.08)]">
          <div
            className="h-full bg-rose-dim transition-all duration-500"
            style={{ width: `${(setCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-5">
        {category.items.map((item) => (
          <BoundaryItem
            key={item.id}
            id={item.id}
            label={item.label}
            value={boundaries[item.id] || null}
            onChange={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Summary ──────────────────────────────────────────────────────────────────

const BoundarySummary = ({ boundaries }: { boundaries: Record<string, BoundaryLevel> }) => {
  const counts = LEVELS.reduce((acc, l) => {
    acc[l.value] = Object.values(boundaries).filter((v) => v === l.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-5 gap-1">
      {LEVELS.map((l) => (
        <div key={l.value} className={clsx('p-3 text-center border', l.color)}>
          <div className="text-xl mb-1">{counts[l.value] || 0}</div>
          <div className="text-[8px] tracking-[0.1em] uppercase">{l.short}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Boundaries Engine Page ───────────────────────────────────────────────────

export const BoundariesEngine = () => {
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryLevel>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalSet = Object.keys(boundaries).length
  const totalItems = BOUNDARY_CATEGORIES.reduce((a, c) => a + c.items.length, 0)

  const handleUpdate = (id: string, level: BoundaryLevel) => {
    setBoundaries((prev) => ({ ...prev, [id]: level }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: save to supabase
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <SectionLabel>Boundaries Engine</SectionLabel>
      <h1 className="font-serif text-2xl font-light text-velour-text mb-2">
        Define your <span className="italic text-rose-light">world</span>
      </h1>
      <p className="text-velour-dim text-sm leading-relaxed mb-6">
        Your boundaries are private and only shared with your matches when you choose to. 
        They help our AI find people truly aligned with you.
      </p>

      {/* Progress */}
      <div className="mb-6 p-4 bg-bg-2 border border-[rgba(185,150,90,0.14)]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] tracking-[0.2em] uppercase text-velour-muted">
            Completion
          </span>
          <span className="text-rose text-sm font-light">
            {totalSet}/{totalItems}
          </span>
        </div>
        <div className="h-px bg-[rgba(185,150,90,0.08)]">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-dim to-rose"
            animate={{ width: `${(totalSet / totalItems) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-velour-muted text-[10px] mt-2">
          {totalSet === 0
            ? 'Start setting your boundaries — the more you share, the better your matches.'
            : totalSet < totalItems / 2
            ? 'Keep going — better data means smarter matches.'
            : totalSet < totalItems
            ? 'Almost there! Your profile is getting strong.'
            : '✓ Complete — your boundaries are fully set.'}
        </p>
      </div>

      {/* Summary */}
      {totalSet > 0 && (
        <div className="mb-6">
          <SectionLabel>Your Summary</SectionLabel>
          <BoundarySummary boundaries={boundaries} />
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-col gap-4 mb-8">
        {BOUNDARY_CATEGORIES.map((cat) => (
          <CategoryPanel
            key={cat.id}
            category={cat}
            boundaries={boundaries}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {/* Save */}
      <div className="sticky bottom-20 lg:bottom-4 pb-2">
        <div className="bg-bg/80 backdrop-blur-md p-3 border border-[rgba(185,150,90,0.2)]">
          <Button
            variant="rose"
            size="lg"
            onClick={handleSave}
            loading={saving}
            disabled={totalSet === 0}
            className="w-full"
          >
            {saved ? '✓ Saved' : 'Save Boundaries'}
          </Button>
          <p className="text-center text-velour-muted text-[9px] mt-2">
            Encrypted · Never sold · Only used for matching
          </p>
        </div>
      </div>
    </div>
  )
}
