import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Avatar, Badge, Button, Input, Textarea, SectionLabel, Divider } from '../ui'
import { useAuthStore } from '../../store'
import type { CoupleProfile, CouplePermissions } from '../../types'

// ─── Mock couple data ─────────────────────────────────────────────────────────

const MOCK_COUPLE: CoupleProfile = {
  id: 'couple-1',
  partner_a_id: 'user-a',
  partner_b_id: 'user-b',
  display_name: 'Aria & Marcus',
  bio: "We've been exploring together for 3 years. Looking for genuine connections with open-minded people.",
  avatar_url: undefined,
  permissions: {
    who_can_initiate: 'both',
    requires_dual_approval: true,
    shared_inbox: true,
    visibility: 'both_required',
  },
  created_at: new Date().toISOString(),
}

// ─── Permission toggle ────────────────────────────────────────────────────────

const PermissionToggle = ({
  label,
  desc,
  value,
  onChange,
}: {
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) => (
  <div className="flex items-start justify-between py-4 border-b border-[rgba(185,150,90,0.08)]">
    <div className="flex-1 pr-4">
      <p className="text-sm text-velour-dim">{label}</p>
      <p className="text-[11px] text-velour-muted mt-0.5 leading-relaxed">{desc}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={clsx(
        'w-12 h-6 relative transition-all duration-300 flex-shrink-0',
        value ? 'bg-rose' : 'bg-[rgba(185,150,90,0.15)]'
      )}
    >
      <span
        className={clsx(
          'absolute top-1 w-4 h-4 bg-bg transition-all duration-300',
          value ? 'left-7' : 'left-1'
        )}
      />
    </button>
  </div>
)

// ─── Couple Dashboard ─────────────────────────────────────────────────────────

const CoupleDashboard = ({
  couple,
  onEdit,
}: {
  couple: CoupleProfile
  onEdit: () => void
}) => {
  const stats = [
    { label: 'Matches', value: '12' },
    { label: 'Pending', value: '3' },
    { label: 'Messages', value: '8' },
    { label: 'Days Active', value: '47' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Couple profile card */}
      <div className="bg-bg-2 border border-[rgba(185,150,90,0.18)] overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-bg-3 to-bg relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl text-rose opacity-10">◈</span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-6 mb-4">
            <div className="w-14 h-14 bg-bg-2 border-2 border-bg flex items-center justify-center">
              <span className="font-serif text-2xl text-rose opacity-40">∞</span>
            </div>
            <button
              onClick={onEdit}
              className="text-[9px] tracking-[0.2em] uppercase text-rose hover:text-rose-light transition-colors border border-[rgba(185,150,90,0.3)] px-3 py-1.5"
            >
              Edit
            </button>
          </div>
          <h2 className="font-serif text-xl font-light text-velour-text mb-1">
            {couple.display_name}
          </h2>
          {couple.bio && (
            <p className="text-velour-dim text-sm leading-relaxed">{couple.bio}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Badge variant="rose">Couple Profile</Badge>
            {couple.permissions.requires_dual_approval && (
              <Badge variant="verified">Dual Approval</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1 bg-[rgba(185,150,90,0.1)]">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-2 px-3 py-4 text-center">
            <div className="font-serif text-2xl font-light text-rose-light">{stat.value}</div>
            <div className="text-[8px] tracking-[0.15em] uppercase text-velour-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div>
        <SectionLabel>Pending Approval</SectionLabel>
        {[
          { name: 'Selene', age: 29, city: 'Paris', score: 87, waitingFor: 'Marcus' },
          { name: 'Jordan', age: 34, city: 'Amsterdam', score: 82, waitingFor: 'Aria' },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 py-3 border-b border-[rgba(185,150,90,0.1)]"
          >
            <Avatar name={item.name} size="sm" />
            <div className="flex-1">
              <p className="text-sm text-velour-dim">{item.name}, {item.age} · {item.city}</p>
              <p className="text-[10px] text-velour-muted">Waiting for {item.waitingFor}'s approval</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 border border-rose/40 flex items-center justify-center">
                <span className="font-serif text-rose text-xs">{item.score}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 border border-[rgba(185,150,90,0.2)] text-velour-muted hover:border-rose hover:text-rose transition-all text-lg leading-none flex items-center justify-center">✓</button>
              <button className="w-8 h-8 border border-[rgba(185,150,90,0.2)] text-velour-muted hover:border-red-400/50 hover:text-red-400/70 transition-all text-sm flex items-center justify-center">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Boundaries sync */}
      <div>
        <SectionLabel>Boundaries Sync</SectionLabel>
        <div className="bg-bg-2 border border-[rgba(185,150,90,0.14)] p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-velour-dim">Synced boundaries</span>
            <span className="text-rose text-sm font-light">18/25</span>
          </div>
          <div className="h-px bg-[rgba(185,150,90,0.08)] mb-3">
            <div className="h-full bg-rose-dim" style={{ width: '72%' }} />
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Physical', sync: 100 },
              { label: 'Emotional', sync: 80 },
              { label: 'Communication', sync: 100 },
              { label: 'Dynamics', sync: 60 },
              { label: 'Privacy', sync: 40 },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="text-[10px] text-velour-muted w-24">{cat.label}</span>
                <div className="flex-1 h-px bg-[rgba(185,150,90,0.08)]">
                  <div
                    className="h-full bg-gradient-to-r from-rose-dim to-rose transition-all duration-700"
                    style={{ width: `${cat.sync}%` }}
                  />
                </div>
                <span className="text-[10px] text-velour-muted w-8 text-right">{cat.sync}%</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4">
            Review Unsynced Boundaries
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Couple Settings ──────────────────────────────────────────────────────────

const CoupleSettings = ({
  couple,
  onBack,
}: {
  couple: CoupleProfile
  onBack: () => void
}) => {
  const [permissions, setPermissions] = useState<CouplePermissions>(couple.permissions)
  const [name, setName] = useState(couple.display_name)
  const [bio, setBio] = useState(couple.bio || '')
  const [saving, setSaving] = useState(false)

  const updatePermission = <K extends keyof CouplePermissions>(
    key: K,
    value: CouplePermissions[K]
  ) => {
    setPermissions(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    onBack()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-velour-muted hover:text-rose transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <SectionLabel>Couple Settings</SectionLabel>
          <h2 className="font-serif text-xl font-light text-velour-text -mt-3">Edit your duo</h2>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Input label="Couple Display Name" value={name} onChange={e => setName(e.target.value)} />
        <Textarea label="About your connection" value={bio} onChange={e => setBio(e.target.value)} rows={3} />

        <Divider />

        <div>
          <SectionLabel>Who can initiate contact?</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'both', label: 'Either partner' },
              { value: 'partner_a', label: 'Partner A only' },
              { value: 'partner_b', label: 'Partner B only' },
              { value: 'either_with_approval', label: 'Either, with approval' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => updatePermission('who_can_initiate', option.value as CouplePermissions['who_can_initiate'])}
                className={clsx(
                  'py-3 px-3 text-[10px] tracking-[0.15em] uppercase border transition-all text-left leading-snug',
                  permissions.who_can_initiate === option.value
                    ? 'bg-rose text-bg border-rose'
                    : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.35)]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Approval & Visibility</SectionLabel>
          <PermissionToggle
            label="Require dual approval"
            desc="Both partners must approve before a match is confirmed"
            value={permissions.requires_dual_approval}
            onChange={v => updatePermission('requires_dual_approval', v)}
          />
          <PermissionToggle
            label="Shared inbox"
            desc="Both partners see all messages in the same inbox"
            value={permissions.shared_inbox}
            onChange={v => updatePermission('shared_inbox', v)}
          />
          <PermissionToggle
            label="Both required to browse"
            desc="Profile only shows when both partners are active"
            value={permissions.visibility === 'both_required'}
            onChange={v => updatePermission('visibility', v ? 'both_required' : 'either_can_browse')}
          />
        </div>

        <div className="flex gap-3 pb-8">
          <Button variant="ghost" className="flex-1" onClick={onBack}>Cancel</Button>
          <Button variant="rose" className="flex-1" onClick={handleSave} loading={saving}>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Couple ────────────────────────────────────────────────────────────

const CreateCouple = ({ onCreated }: { onCreated: () => void }) => {
  const [step, setStep] = useState(0)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="text-4xl text-rose opacity-20 mb-4">◈</div>
        <h2 className="font-serif text-2xl font-light text-velour-text mb-2">
          Create a Couple Profile
        </h2>
        <p className="text-velour-dim text-sm leading-relaxed max-w-xs mx-auto">
          Connect with your partner to build a shared profile and explore together.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Couple display name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Alex & Sam"
        />
        <Input
          label="Partner's Velour email"
          type="email"
          value={partnerEmail}
          onChange={e => setPartnerEmail(e.target.value)}
          placeholder="partner@email.com"
        />
        <p className="text-[11px] text-velour-muted leading-relaxed">
          We'll send your partner an invitation. Both accounts must confirm before the couple profile is created.
        </p>
        <Button
          variant="rose"
          size="lg"
          className="w-full"
          disabled={!name || !partnerEmail}
          onClick={onCreated}
        >
          Send Invitation
        </Button>
      </div>
    </div>
  )
}

// ─── Couple System Page ───────────────────────────────────────────────────────

export const CoupleSystemPage = () => {
  const [hasCouple] = useState(true) // Toggle to false to see create flow
  const [editing, setEditing] = useState(false)
  const couple = MOCK_COUPLE

  if (!hasCouple) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <SectionLabel>Couple System</SectionLabel>
        <CreateCouple onCreated={() => {}} />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <SectionLabel>Couple System</SectionLabel>
      {!editing && (
        <h1 className="font-serif text-2xl font-light text-velour-text mb-6">
          Your <span className="italic text-rose-light">connection</span>
        </h1>
      )}

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CoupleSettings couple={couple} onBack={() => setEditing(false)} />
          </motion.div>
        ) : (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CoupleDashboard couple={couple} onEdit={() => setEditing(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
