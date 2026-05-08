import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, Badge, Button, CompatibilityBar, SectionLabel, Spinner } from '../ui'
import { useAuthStore, useDiscoverStore } from '../../store'
import { discoverProfiles } from '../../lib/supabase'
import type { UserProfile } from '../../types'

// ─── Profile Card (swipeable) ─────────────────────────────────────────────────

const ProfileCard = ({
  profile,
  onLike,
  onPass,
}: {
  profile: UserProfile
  onLike: () => void
  onPass: () => void
}) => {
  const [expanded, setExpanded] = useState(false)

  // Mock compatibility (replace with real AI scores)
  const compatibility = {
    overall: 0.87,
    emotional: 0.91,
    communication: 0.82,
    exploration: 0.78,
    dynamic: 0.94,
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ duration: 0.35 }}
      className="relative bg-bg-2 border border-[rgba(185,150,90,0.18)] overflow-hidden"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] max-h-[55vh] overflow-hidden bg-bg-3">
        {profile.photos?.[0] ? (
          <img
            src={profile.photos[0]}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-6xl text-rose opacity-20">
              {profile.display_name?.[0] || '?'}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-2 via-transparent to-transparent" />

        {/* Trust badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={profile.trust_level === 'premium_verified' ? 'premium' : 'verified'}>
            {profile.trust_level?.replace('_', ' ') || 'basic'}
          </Badge>
        </div>

        {/* Compatibility score overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border border-rose/40 flex items-center justify-center bg-bg/60 backdrop-blur-sm">
              <span className="font-serif text-rose text-sm font-light">
                {Math.round(compatibility.overall * 100)}
              </span>
            </div>
            <span className="text-[9px] tracking-[0.2em] uppercase text-velour-dim">
              Match
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-serif text-2xl font-light text-velour-text">
              {profile.display_name}
              {profile.age && <span className="text-velour-dim ml-2 text-lg">{profile.age}</span>}
            </h2>
            {profile.location_city && (
              <p className="text-velour-muted text-[11px] tracking-[0.1em] mt-0.5">
                {profile.location_city}
                {profile.location_country && `, ${profile.location_country}`}
              </p>
            )}
          </div>
          {profile.is_couple_profile && (
            <Badge variant="rose">Couple</Badge>
          )}
        </div>

        {profile.tagline && (
          <p className="font-serif italic text-velour-dim text-sm mb-4 leading-relaxed">
            "{profile.tagline}"
          </p>
        )}

        {/* Compatibility bars */}
        <div className="flex flex-col gap-3 mb-5">
          <SectionLabel>Compatibility</SectionLabel>
          <CompatibilityBar score={compatibility.emotional} label="Emotional" />
          <CompatibilityBar score={compatibility.communication} label="Communication" />
          <CompatibilityBar score={compatibility.exploration} label="Exploration" />
          <CompatibilityBar score={compatibility.dynamic} label="Dynamic" />
        </div>

        {/* Expandable bio */}
        {profile.bio && (
          <div className="mb-5">
            <p className={`text-velour-dim text-sm leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
              {profile.bio}
            </p>
            {profile.bio.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-rose text-[10px] tracking-[0.1em] uppercase mt-1 hover:text-rose-light transition-colors"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={onPass} className="w-full">
            Pass
          </Button>
          <Button variant="rose" onClick={onLike} className="w-full">
            Connect
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyDiscover = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-8">
    <div className="text-5xl text-rose opacity-20 mb-6">◎</div>
    <h3 className="font-serif text-2xl font-light text-velour-dim mb-3">
      You've seen everyone
    </h3>
    <p className="text-velour-muted text-sm leading-relaxed max-w-xs">
      Come back soon — new members join every day. Your perfect match is out there.
    </p>
  </div>
)

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type FilterType = 'all' | 'couples' | 'singles' | 'verified'

const FilterBar = ({
  active,
  onChange,
}: {
  active: FilterType
  onChange: (f: FilterType) => void
}) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'couples', label: 'Couples' },
    { value: 'singles', label: 'Singles' },
    { value: 'verified', label: 'Verified' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex-shrink-0 px-4 py-2 text-[9px] tracking-[0.2em] uppercase transition-all duration-200 ${
            active === f.value
              ? 'bg-rose text-bg'
              : 'border border-[rgba(185,150,90,0.2)] text-velour-muted hover:border-[rgba(185,150,90,0.4)] hover:text-velour-dim'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

// ─── Discover Page ────────────────────────────────────────────────────────────

export const DiscoverPage = () => {
  const { user } = useAuthStore()
  const { profiles, currentIndex, like, pass, setProfiles, isLoading, setLoading } =
    useDiscoverStore()
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const { data } = await discoverProfiles(user.id)
      if (data) setProfiles(data as UserProfile[])
      setLoading(false)
    }
    load()
  }, [user])

  const currentProfile = profiles[currentIndex]

  const filtered = profiles.filter((p) => {
    if (filter === 'couples') return p.is_couple_profile
    if (filter === 'singles') return !p.is_couple_profile
    if (filter === 'verified') return p.trust_level !== 'basic'
    return true
  })
  const currentFiltered = filtered[currentIndex]

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel>Discover</SectionLabel>
          <h1 className="font-serif text-2xl font-light text-velour-text">
            Find your <span className="italic text-rose-light">connection</span>
          </h1>
        </div>
        <button className="w-10 h-10 border border-[rgba(185,150,90,0.2)] flex items-center justify-center text-velour-muted hover:text-rose transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" />
          </svg>
        </button>
      </div>

      <FilterBar active={filter} onChange={setFilter} />

      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentFiltered ? (
              <ProfileCard
                key={currentFiltered.id}
                profile={currentFiltered}
                onLike={() => like(currentFiltered.id)}
                onPass={() => pass(currentFiltered.id)}
              />
            ) : (
              <EmptyDiscover key="empty" />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Progress */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-velour-muted text-[10px]">
            {Math.min(currentIndex + 1, filtered.length)} of {filtered.length}
          </span>
          <div className="flex-1 max-w-32 h-px bg-[rgba(185,150,90,0.1)]">
            <div
              className="h-full bg-rose-dim transition-all"
              style={{ width: `${((currentIndex) / filtered.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
