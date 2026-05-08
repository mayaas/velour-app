import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, Badge, Button, Input, Textarea, SectionLabel, Divider, Spinner } from '../ui'
import { useAuthStore, useUIStore } from '../../store'
import { BoundariesEngine } from '../boundaries/BoundariesEngine'
import type { RelationshipType, AttachmentStyle, DynamicRole } from '../../types'

// ─── Profile View ─────────────────────────────────────────────────────────────

const ProfileView = ({ onEdit }: { onEdit: () => void }) => {
  const { profile, user } = useAuthStore()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="text-4xl text-rose opacity-20 mb-6">◎</div>
        <h3 className="font-serif text-xl font-light text-velour-dim mb-3">
          Create your profile
        </h3>
        <p className="text-velour-muted text-sm mb-8 max-w-xs leading-relaxed">
          Tell us about yourself to start connecting. Your profile is private until you match.
        </p>
        <Button onClick={onEdit}>Set Up Profile</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Hero */}
      <div className="relative mb-6">
        {profile.photos?.[0] ? (
          <div className="aspect-square w-full overflow-hidden bg-bg-3">
            <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square w-full bg-bg-2 border border-[rgba(185,150,90,0.14)] flex items-center justify-center">
            <span className="font-serif text-8xl text-rose opacity-10">
              {profile.display_name?.[0] || '?'}
            </span>
          </div>
        )}
        <button
          onClick={onEdit}
          className="absolute bottom-4 right-4 bg-bg/80 backdrop-blur-sm border border-[rgba(185,150,90,0.3)] px-4 py-2 text-[9px] tracking-[0.2em] uppercase text-rose hover:bg-bg transition-all"
        >
          Edit
        </button>
      </div>

      {/* Identity */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-serif text-3xl font-light text-velour-text">
              {profile.display_name}
              {profile.age && <span className="text-velour-dim ml-2 text-2xl">{profile.age}</span>}
            </h1>
            {profile.location_city && (
              <p className="text-velour-muted text-sm mt-1">
                {profile.location_city}
                {profile.location_country && `, ${profile.location_country}`}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={profile.trust_level === 'premium_verified' ? 'premium' : 'verified'}>
              {profile.trust_level?.replace('_', ' ') || 'basic'}
            </Badge>
            {profile.is_couple_profile && <Badge variant="rose">Couple</Badge>}
          </div>
        </div>

        {profile.tagline && (
          <p className="font-serif italic text-velour-dim text-base mt-3">
            "{profile.tagline}"
          </p>
        )}
      </div>

      <Divider />

      {/* About */}
      {profile.bio && (
        <div className="mb-6">
          <SectionLabel>About</SectionLabel>
          <p className="text-velour-dim text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Attributes */}
      <div className="mb-6">
        <SectionLabel>Profile</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Looking for', value: profile.relationship_type },
            { label: 'Attachment', value: profile.attachment_style },
            { label: 'Dynamic', value: profile.dynamic_role },
            { label: 'Exploration', value: profile.exploration_level ? `Level ${profile.exploration_level}` : null },
          ]
            .filter((r) => r.value)
            .map((row) => (
              <div key={row.label} className="bg-bg-2 border border-[rgba(185,150,90,0.1)] p-3">
                <div className="text-[8px] tracking-[0.2em] uppercase text-velour-muted mb-1">
                  {row.label}
                </div>
                <div className="text-sm text-velour-dim capitalize">
                  {String(row.value).replace('_', ' ')}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Divider />

      {/* Privacy status */}
      <div className="mb-6">
        <SectionLabel>Privacy</SectionLabel>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Stealth Mode', value: profile.is_stealth },
            { label: 'Hidden Profile', value: profile.is_hidden },
            { label: 'Show Online Status', value: profile.show_online_status },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2.5 border-b border-[rgba(185,150,90,0.08)]">
              <span className="text-sm text-velour-dim">{setting.label}</span>
              <span className={`text-[10px] tracking-[0.1em] uppercase ${setting.value ? 'text-rose' : 'text-velour-muted'}`}>
                {setting.value ? 'On' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button variant="ghost" className="w-full" onClick={onEdit}>
        Edit Profile
      </Button>
    </div>
  )
}

// ─── Profile Edit Form ────────────────────────────────────────────────────────

const ProfileEdit = ({ onDone }: { onDone: () => void }) => {
  const { profile, setProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    age: profile?.age || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    location_city: profile?.location_city || '',
    relationship_type: profile?.relationship_type || 'single',
    attachment_style: profile?.attachment_style || '',
    dynamic_role: profile?.dynamic_role || 'none',
    exploration_level: profile?.exploration_level || 3,
    is_stealth: profile?.is_stealth || false,
    is_hidden: profile?.is_hidden || false,
    show_online_status: profile?.show_online_status ?? true,
  })

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    // TODO: save to supabase
    setSaving(false)
    onDone()
  }

  const relationshipTypes: RelationshipType[] = ['single', 'couple', 'poly', 'open']
  const attachmentStyles: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized']
  const dynamicRoles: DynamicRole[] = ['dominant', 'submissive', 'switch', 'none']

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onDone} className="text-velour-muted hover:text-rose transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <SectionLabel>Edit Profile</SectionLabel>
          <h2 className="font-serif text-xl font-light text-velour-text -mt-3">Your Identity</h2>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Input
          label="Display Name"
          value={form.display_name}
          onChange={(e) => update('display_name', e.target.value)}
          placeholder="How others see you"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Age"
            type="number"
            value={String(form.age)}
            onChange={(e) => update('age', parseInt(e.target.value))}
            placeholder="Age"
            min={18}
            max={99}
          />
          <Input
            label="City"
            value={form.location_city}
            onChange={(e) => update('location_city', e.target.value)}
            placeholder="City"
          />
        </div>

        <Input
          label="Tagline"
          value={form.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          placeholder="One line that defines you"
        />

        <Textarea
          label="About You"
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Who you are, what you're looking for..."
          rows={4}
        />

        <Divider />

        {/* Relationship type */}
        <div>
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim block mb-3">
            Relationship Structure
          </label>
          <div className="grid grid-cols-2 gap-2">
            {relationshipTypes.map((type) => (
              <button
                key={type}
                onClick={() => update('relationship_type', type)}
                className={`py-3 text-[10px] tracking-[0.2em] uppercase border transition-all duration-200 ${
                  form.relationship_type === type
                    ? 'bg-rose text-bg border-rose'
                    : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.4)]'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Attachment style */}
        <div>
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim block mb-3">
            Attachment Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {attachmentStyles.map((style) => (
              <button
                key={style}
                onClick={() => update('attachment_style', style)}
                className={`py-3 text-[10px] tracking-[0.2em] uppercase border transition-all duration-200 ${
                  form.attachment_style === style
                    ? 'bg-rose text-bg border-rose'
                    : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.4)]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic role */}
        <div>
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim block mb-3">
            Dynamic Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {dynamicRoles.map((role) => (
              <button
                key={role}
                onClick={() => update('dynamic_role', role)}
                className={`py-3 text-[10px] tracking-[0.2em] uppercase border transition-all duration-200 ${
                  form.dynamic_role === role
                    ? 'bg-rose text-bg border-rose'
                    : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.4)]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Exploration level */}
        <div>
          <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim block mb-3">
            Exploration Level — {form.exploration_level}/5
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.exploration_level}
            onChange={(e) => update('exploration_level', parseInt(e.target.value))}
            className="w-full accent-rose"
          />
          <div className="flex justify-between text-[9px] text-velour-muted mt-1">
            <span>Curious</span>
            <span>Adventurous</span>
            <span>Liberated</span>
          </div>
        </div>

        <Divider />

        {/* Privacy toggles */}
        <div>
          <SectionLabel>Privacy Settings</SectionLabel>
          {[
            { key: 'is_stealth', label: 'Stealth Mode', desc: 'Browse without appearing online' },
            { key: 'is_hidden', label: 'Hidden Profile', desc: 'Only visible to mutual matches' },
            { key: 'show_online_status', label: 'Show Online Status', desc: 'Let matches see when you\'re active' },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between py-4 border-b border-[rgba(185,150,90,0.08)]"
            >
              <div>
                <p className="text-sm text-velour-dim">{setting.label}</p>
                <p className="text-[10px] text-velour-muted mt-0.5">{setting.desc}</p>
              </div>
              <button
                onClick={() => update(setting.key, !(form as Record<string, unknown>)[setting.key])}
                className={`w-12 h-6 relative transition-all duration-300 ${
                  (form as Record<string, unknown>)[setting.key]
                    ? 'bg-rose'
                    : 'bg-[rgba(185,150,90,0.15)]'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-bg transition-all duration-300 ${
                    (form as Record<string, unknown>)[setting.key] ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-2 pb-8">
          <Button variant="ghost" className="flex-1" onClick={onDone}>
            Cancel
          </Button>
          <Button variant="rose" className="flex-1" onClick={handleSave} loading={saving}>
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Page (with tabs) ─────────────────────────────────────────────────

type ProfileTab = 'profile' | 'boundaries'

export const ProfilePage = () => {
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<ProfileTab>('profile')

  if (editing) return <ProfileEdit onDone={() => setEditing(false)} />

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-[rgba(185,150,90,0.14)]">
        <div className="flex max-w-lg mx-auto px-4">
          {(['profile', 'boundaries'] as ProfileTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-[9px] tracking-[0.25em] uppercase transition-all duration-200 border-b-2 ${
                tab === t
                  ? 'text-rose border-rose'
                  : 'text-velour-muted border-transparent hover:text-velour-dim'
              }`}
            >
              {t === 'profile' ? 'My Profile' : 'Boundaries'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'profile' ? (
        <ProfileView onEdit={() => setEditing(true)} />
      ) : (
        <BoundariesEngine />
      )}
    </div>
  )
}
