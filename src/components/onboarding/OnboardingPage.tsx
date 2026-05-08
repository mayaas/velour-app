import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Button, Input, Textarea, SectionLabel } from '../ui'
import { useAuthStore } from '../../store'
import type { RelationshipType, AttachmentStyle, DynamicRole } from '../../types'

// ─── Step types ───────────────────────────────────────────────────────────────

interface OnboardingData {
  display_name: string
  age: string
  relationship_type: RelationshipType
  is_couple: boolean
  attachment_style: AttachmentStyle | ''
  dynamic_role: DynamicRole
  exploration_level: number
  bio: string
  tagline: string
  interests: string[]
}

const INTERESTS = [
  'Open relationships', 'Polyamory', 'BDSM / Kink', 'Tantra',
  'Swinging', 'Solo poly', 'Kitchen table poly', 'Parallel poly',
  'Relationship anarchy', 'Soft kink', 'D/s dynamics', 'Cohabitation',
  'Long distance', 'Queer dynamics', 'Age gap', 'Power exchange',
]

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <div className="flex gap-1 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={clsx(
          'flex-1 h-0.5 transition-all duration-500',
          i < step ? 'bg-rose' : i === step ? 'bg-rose-dim' : 'bg-[rgba(185,150,90,0.15)]'
        )}
      />
    ))}
  </div>
)

// ─── Step 1: Name & Age ───────────────────────────────────────────────────────

const StepIdentity = ({
  data,
  onChange,
  onNext,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: unknown) => void
  onNext: () => void
}) => (
  <div>
    <SectionLabel>Step 1 of 5</SectionLabel>
    <h2 className="font-serif text-3xl font-light text-velour-text mb-2">
      Who are <em className="italic text-rose-light">you?</em>
    </h2>
    <p className="text-velour-dim text-sm mb-8 leading-relaxed">
      Your display name is what others see. It doesn't have to be your real name.
    </p>
    <div className="flex flex-col gap-4">
      <Input
        label="Display Name"
        value={data.display_name}
        onChange={e => onChange('display_name', e.target.value)}
        placeholder="How you'd like to be known"
        autoFocus
      />
      <Input
        label="Age"
        type="number"
        value={data.age}
        onChange={e => onChange('age', e.target.value)}
        placeholder="Your age (18+)"
        min={18}
      />
    </div>
    <Button
      variant="rose"
      size="lg"
      className="w-full mt-8"
      disabled={!data.display_name || !data.age || parseInt(data.age) < 18}
      onClick={onNext}
    >
      Continue
    </Button>
  </div>
)

// ─── Step 2: Relationship structure ──────────────────────────────────────────

const StepStructure = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: unknown) => void
  onNext: () => void
  onBack: () => void
}) => {
  const options: { value: RelationshipType; label: string; desc: string }[] = [
    { value: 'single', label: 'Single', desc: 'Exploring as an individual' },
    { value: 'couple', label: 'Couple', desc: 'Exploring with a partner' },
    { value: 'poly', label: 'Polyamorous', desc: 'Multiple relationships' },
    { value: 'open', label: 'Open', desc: 'Committed + open to connections' },
  ]

  return (
    <div>
      <SectionLabel>Step 2 of 5</SectionLabel>
      <h2 className="font-serif text-3xl font-light text-velour-text mb-2">
        How do you <em className="italic text-rose-light">connect?</em>
      </h2>
      <p className="text-velour-dim text-sm mb-8 leading-relaxed">
        This helps us find the right matches for your structure.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange('relationship_type', opt.value)}
            className={clsx(
              'flex items-center gap-4 p-4 border text-left transition-all duration-200',
              data.relationship_type === opt.value
                ? 'border-[rgba(201,160,122,0.5)] bg-[rgba(201,160,122,0.06)]'
                : 'border-[rgba(185,150,90,0.14)] hover:border-[rgba(185,150,90,0.3)]'
            )}
          >
            <div className={clsx(
              'w-4 h-4 border-2 rounded-full flex-shrink-0 transition-all',
              data.relationship_type === opt.value ? 'border-rose bg-rose' : 'border-velour-muted'
            )} />
            <div>
              <p className="text-sm text-velour-text">{opt.label}</p>
              <p className="text-[11px] text-velour-muted">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="rose" className="flex-1" onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

// ─── Step 3: Dynamics ─────────────────────────────────────────────────────────

const StepDynamics = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: unknown) => void
  onNext: () => void
  onBack: () => void
}) => {
  const attachments: { value: AttachmentStyle; label: string; desc: string }[] = [
    { value: 'secure', label: 'Secure', desc: 'Comfortable with closeness and independence' },
    { value: 'anxious', label: 'Anxious', desc: 'Crave closeness, fear abandonment' },
    { value: 'avoidant', label: 'Avoidant', desc: 'Value independence, discomfort with intimacy' },
    { value: 'disorganized', label: 'Disorganized', desc: 'Mixed — still figuring it out' },
  ]

  const roles: { value: DynamicRole; label: string }[] = [
    { value: 'dominant', label: 'Dominant' },
    { value: 'submissive', label: 'Submissive' },
    { value: 'switch', label: 'Switch' },
    { value: 'none', label: 'Not applicable' },
  ]

  return (
    <div>
      <SectionLabel>Step 3 of 5</SectionLabel>
      <h2 className="font-serif text-3xl font-light text-velour-text mb-2">
        Your <em className="italic text-rose-light">dynamics</em>
      </h2>
      <p className="text-velour-dim text-sm mb-6 leading-relaxed">
        Understanding your style helps us find deep compatibility.
      </p>

      <p className="text-[9px] tracking-[0.3em] uppercase text-velour-dim mb-3">Attachment Style</p>
      <div className="flex flex-col gap-2 mb-6">
        {attachments.map(a => (
          <button
            key={a.value}
            onClick={() => onChange('attachment_style', a.value)}
            className={clsx(
              'flex items-start gap-3 p-3 border text-left transition-all',
              data.attachment_style === a.value
                ? 'border-[rgba(201,160,122,0.5)] bg-[rgba(201,160,122,0.06)]'
                : 'border-[rgba(185,150,90,0.14)] hover:border-[rgba(185,150,90,0.3)]'
            )}
          >
            <div className={clsx('w-3 h-3 border-2 rounded-full flex-shrink-0 mt-1', data.attachment_style === a.value ? 'border-rose bg-rose' : 'border-velour-muted')} />
            <div>
              <p className="text-sm text-velour-dim">{a.label}</p>
              <p className="text-[10px] text-velour-muted">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[9px] tracking-[0.3em] uppercase text-velour-dim mb-3">Dynamic Role</p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {roles.map(r => (
          <button
            key={r.value}
            onClick={() => onChange('dynamic_role', r.value)}
            className={clsx(
              'py-3 text-[10px] tracking-[0.2em] uppercase border transition-all',
              data.dynamic_role === r.value
                ? 'bg-rose text-bg border-rose'
                : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.35)]'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <p className="text-[9px] tracking-[0.3em] uppercase text-velour-dim mb-3">
        Exploration Level — {data.exploration_level}/5
      </p>
      <input
        type="range" min={1} max={5}
        value={data.exploration_level}
        onChange={e => onChange('exploration_level', parseInt(e.target.value))}
        className="w-full accent-rose mb-1"
      />
      <div className="flex justify-between text-[9px] text-velour-muted mb-6">
        <span>Curious</span><span>Open</span><span>Liberated</span>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="rose" className="flex-1" onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

// ─── Step 4: Interests ────────────────────────────────────────────────────────

const StepInterests = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: unknown) => void
  onNext: () => void
  onBack: () => void
}) => {
  const toggle = (interest: string) => {
    const current = data.interests
    const next = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest]
    onChange('interests', next)
  }

  return (
    <div>
      <SectionLabel>Step 4 of 5</SectionLabel>
      <h2 className="font-serif text-3xl font-light text-velour-text mb-2">
        Your <em className="italic text-rose-light">interests</em>
      </h2>
      <p className="text-velour-dim text-sm mb-6 leading-relaxed">
        Select everything that resonates. This helps match you with aligned people.
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => toggle(interest)}
            className={clsx(
              'px-3 py-2 text-[10px] tracking-[0.1em] border transition-all duration-200',
              data.interests.includes(interest)
                ? 'bg-rose text-bg border-rose'
                : 'border-[rgba(185,150,90,0.18)] text-velour-muted hover:border-[rgba(185,150,90,0.38)]'
            )}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="rose" className="flex-1" onClick={onNext} disabled={data.interests.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}

// ─── Step 5: Bio ──────────────────────────────────────────────────────────────

const StepBio = ({
  data,
  onChange,
  onDone,
  onBack,
  loading,
}: {
  data: OnboardingData
  onChange: (k: keyof OnboardingData, v: unknown) => void
  onDone: () => void
  onBack: () => void
  loading: boolean
}) => (
  <div>
    <SectionLabel>Step 5 of 5</SectionLabel>
    <h2 className="font-serif text-3xl font-light text-velour-text mb-2">
      Tell your <em className="italic text-rose-light">story</em>
    </h2>
    <p className="text-velour-dim text-sm mb-6 leading-relaxed">
      A great bio is specific, honest, and shows personality. Skip the clichés.
    </p>
    <div className="flex flex-col gap-4">
      <Input
        label="Tagline (one line)"
        value={data.tagline}
        onChange={e => onChange('tagline', e.target.value)}
        placeholder="What defines you in a sentence"
      />
      <Textarea
        label="About you"
        value={data.bio}
        onChange={e => onChange('bio', e.target.value)}
        placeholder="Who you are, what you're looking for, what makes you unique..."
        rows={5}
      />
      <p className="text-[10px] text-velour-muted">
        Tip: Mention one specific thing you love + what you're genuinely looking for.
        Avoid: "I love to laugh", "no drama", "looking for adventures".
      </p>
    </div>
    <div className="flex gap-3 mt-8">
      <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>
      <Button
        variant="rose" className="flex-1"
        onClick={onDone} loading={loading}
        disabled={!data.bio}
      >
        Enter Velour
      </Button>
    </div>
  </div>
)

// ─── Onboarding Page ──────────────────────────────────────────────────────────

export const OnboardingPage = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    display_name: '',
    age: '',
    relationship_type: 'single',
    is_couple: false,
    attachment_style: '',
    dynamic_role: 'none',
    exploration_level: 3,
    bio: '',
    tagline: '',
    interests: [],
  })

  const update = (key: keyof OnboardingData, value: unknown) =>
    setData(prev => ({ ...prev, [key]: value }))

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const handleDone = async () => {
    setSaving(true)
    // TODO: save to Supabase
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    onComplete()
  }

  const STEPS = [
    <StepIdentity data={data} onChange={update} onNext={next} />,
    <StepStructure data={data} onChange={update} onNext={next} onBack={back} />,
    <StepDynamics data={data} onChange={update} onNext={next} onBack={back} />,
    <StepInterests data={data} onChange={update} onNext={next} onBack={back} />,
    <StepBio data={data} onChange={update} onDone={handleDone} onBack={back} loading={saving} />,
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[rgba(185,150,90,0.1)]">
        <div className="font-serif text-xl font-light text-velour-text tracking-wide">
          Velour<span className="text-rose">.</span>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg mx-auto w-full">
        <ProgressBar step={step} total={STEPS.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
