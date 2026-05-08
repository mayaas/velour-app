import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, Badge, Button, SectionLabel, Spinner } from '../ui'
import type { UserProfile, CompatibilityBreakdown } from '../../types'

// ─── Mock data (replace with real Supabase queries) ───────────────────────────

const MOCK_MATCHES: Array<{ profile: UserProfile; compatibility: CompatibilityBreakdown; matchedAt: string }> = [
  {
    profile: {
      id: '1',
      user_id: 'u1',
      display_name: 'Aria & Marcus',
      age: 32,
      bio: 'Exploring together for 3 years. We love deep conversations and genuine connections.',
      tagline: 'Two hearts, open minds',
      photos: [],
      trust_level: 'premium_verified',
      relationship_type: 'couple',
      is_couple_profile: true,
      location_city: 'London',
      location_country: 'UK',
      attachment_style: 'secure',
      dynamic_role: 'switch',
      exploration_level: 4,
      is_stealth: false,
      is_hidden: false,
      show_online_status: true,
      created_at: '',
      updated_at: '',
    },
    compatibility: { emotional: 0.92, communication: 0.88, exploration: 0.85, dynamic: 0.91, boundaries: 0.96, values: 0.89, overall: 0.90 },
    matchedAt: '2 hours ago',
  },
  {
    profile: {
      id: '2',
      user_id: 'u2',
      display_name: 'Selene',
      age: 29,
      bio: 'Polyamorous, emotionally available, looking for genuine connection with thoughtful people.',
      tagline: 'Depth over distance',
      photos: [],
      trust_level: 'verified',
      relationship_type: 'poly',
      is_couple_profile: false,
      location_city: 'Paris',
      location_country: 'FR',
      attachment_style: 'secure',
      dynamic_role: 'switch',
      exploration_level: 3,
      is_stealth: false,
      is_hidden: false,
      show_online_status: false,
      created_at: '',
      updated_at: '',
    },
    compatibility: { emotional: 0.94, communication: 0.91, exploration: 0.77, dynamic: 0.83, boundaries: 0.88, values: 0.92, overall: 0.87 },
    matchedAt: '1 day ago',
  },
  {
    profile: {
      id: '3',
      user_id: 'u3',
      display_name: 'Orion',
      age: 35,
      bio: 'Thoughtful, curious, and here for meaningful connections. Dom energy, secure attachment.',
      tagline: 'Presence over performance',
      photos: [],
      trust_level: 'community_verified',
      relationship_type: 'open',
      is_couple_profile: false,
      location_city: 'Berlin',
      location_country: 'DE',
      attachment_style: 'secure',
      dynamic_role: 'dominant',
      exploration_level: 5,
      is_stealth: false,
      is_hidden: false,
      show_online_status: true,
      created_at: '',
      updated_at: '',
    },
    compatibility: { emotional: 0.86, communication: 0.79, exploration: 0.95, dynamic: 0.98, boundaries: 0.91, values: 0.84, overall: 0.89 },
    matchedAt: '3 days ago',
  },
]

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard = ({
  profile,
  compatibility,
  matchedAt,
  onMessage,
}: {
  profile: UserProfile
  compatibility: CompatibilityBreakdown
  matchedAt: string
  onMessage: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-bg-2 border border-[rgba(185,150,90,0.14)] p-4 hover:border-[rgba(185,150,90,0.3)] transition-all duration-300"
  >
    <div className="flex gap-4">
      <Avatar src={profile.avatar_url} name={profile.display_name} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-serif text-lg font-light text-velour-text leading-tight">
              {profile.display_name}
              {profile.age && <span className="text-velour-dim text-base ml-1.5">{profile.age}</span>}
            </h3>
            <p className="text-velour-muted text-[10px]">
              {profile.location_city} · Matched {matchedAt}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-9 h-9 border border-rose/40 flex items-center justify-center">
              <span className="font-serif text-rose text-sm">{Math.round(compatibility.overall * 100)}</span>
            </div>
          </div>
        </div>

        {profile.tagline && (
          <p className="font-serif italic text-velour-dim text-sm mb-3 line-clamp-1">
            "{profile.tagline}"
          </p>
        )}

        {/* Mini compat bars */}
        <div className="flex gap-2 mb-3">
          {[
            { label: 'E', score: compatibility.emotional },
            { label: 'C', score: compatibility.communication },
            { label: 'D', score: compatibility.dynamic },
            { label: 'B', score: compatibility.boundaries },
          ].map(({ label, score }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="h-8 w-3 bg-[rgba(185,150,90,0.08)] relative overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${score * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-dim to-rose"
                />
              </div>
              <span className="text-[8px] text-velour-muted">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={profile.trust_level === 'premium_verified' ? 'premium' : 'verified'}>
            {profile.trust_level?.replace('_', ' ')}
          </Badge>
          {profile.is_couple_profile && <Badge variant="rose">Couple</Badge>}
        </div>
      </div>
    </div>

    <div className="mt-4 flex gap-2">
      <Button variant="ghost" size="sm" className="flex-1">View</Button>
      <Button variant="rose" size="sm" className="flex-1" onClick={onMessage}>
        Message
      </Button>
    </div>
  </motion.div>
)

// ─── Matches Page ─────────────────────────────────────────────────────────────

export const MatchesPage = () => (
  <div className="px-4 py-6 max-w-lg mx-auto">
    <SectionLabel>Your Matches</SectionLabel>
    <h1 className="font-serif text-2xl font-light text-velour-text mb-6">
      <span className="italic text-rose-light">{MOCK_MATCHES.length}</span> connections
    </h1>

    {MOCK_MATCHES.length === 0 ? (
      <div className="text-center py-24">
        <div className="text-4xl text-rose opacity-20 mb-6">◇</div>
        <p className="font-serif text-velour-dim text-lg">No matches yet</p>
        <p className="text-velour-muted text-sm mt-2">Keep exploring — your match is out there.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {MOCK_MATCHES.map((m) => (
          <MatchCard
            key={m.profile.id}
            {...m}
            onMessage={() => {}}
          />
        ))}
      </div>
    )}
  </div>
)

// ─── Conversation List Item ───────────────────────────────────────────────────

const ConvoItem = ({
  profile,
  lastMessage,
  unread,
  onClick,
}: {
  profile: UserProfile
  lastMessage: string
  unread: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-4 border-b border-[rgba(185,150,90,0.1)] hover:bg-bg-2 transition-all duration-200 text-left"
  >
    <div className="relative">
      <Avatar src={profile.avatar_url} name={profile.display_name} size="md" />
      {profile.show_online_status && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-bg" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className={`font-sans text-sm ${unread ? 'text-velour-text' : 'text-velour-dim'}`}>
          {profile.display_name}
        </span>
        <span className="text-[10px] text-velour-muted">2h</span>
      </div>
      <p className={`text-[12px] truncate ${unread ? 'text-velour-dim' : 'text-velour-muted'}`}>
        {lastMessage}
      </p>
    </div>
    {unread && (
      <span className="w-2 h-2 bg-rose rounded-full flex-shrink-0" />
    )}
  </button>
)

// ─── Messages Page ────────────────────────────────────────────────────────────

export const MessagesPage = () => {
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [input, setInput] = useState('')

  const conversations = MOCK_MATCHES.map((m, i) => ({
    ...m,
    lastMessage: i === 0 ? 'Would love to connect sometime 🙏' : i === 1 ? 'That sounds amazing...' : 'Hey, saw your profile',
    unread: i === 0,
  }))

  const active = conversations.find((c) => c.profile.id === activeConvo)

  if (activeConvo && active) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-screen max-w-lg mx-auto">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[rgba(185,150,90,0.14)] bg-bg-2/95 backdrop-blur-md">
          <button
            onClick={() => setActiveConvo(null)}
            className="text-velour-muted hover:text-rose transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <Avatar src={active.profile.avatar_url} name={active.profile.display_name} size="sm" />
          <div>
            <p className="text-sm text-velour-text">{active.profile.display_name}</p>
            <p className="text-[10px] text-emerald-400">Online</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-8 h-8 border border-[rgba(185,150,90,0.2)] flex items-center justify-center text-velour-muted hover:text-rose transition-colors">
              <span className="font-serif text-xs">{Math.round(active.compatibility.overall * 100)}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="text-center text-[10px] text-velour-muted tracking-[0.15em] py-4">
            You matched · {active.matchedAt}
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-bg-2 border border-[rgba(185,150,90,0.14)] px-4 py-3 text-sm text-velour-dim leading-relaxed">
              {active.lastMessage}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[rgba(185,150,90,0.14)] bg-bg">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-bg-2 border border-[rgba(185,150,90,0.18)] px-4 py-3 text-sm text-velour-text placeholder-velour-muted outline-none focus:border-[rgba(185,150,90,0.4)]"
              onKeyDown={(e) => e.key === 'Enter' && setInput('')}
            />
            <button
              onClick={() => setInput('')}
              className="bg-rose text-bg px-4 py-3 hover:bg-rose-light transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <p className="text-[9px] text-velour-muted mt-2 text-center">
            🔒 End-to-end encrypted · Messages expire in 30 days
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 py-6 border-b border-[rgba(185,150,90,0.14)]">
        <SectionLabel>Messages</SectionLabel>
        <h1 className="font-serif text-2xl font-light text-velour-text">
          Your <span className="italic text-rose-light">conversations</span>
        </h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-24 px-8">
          <div className="text-4xl text-rose opacity-20 mb-6">◇</div>
          <p className="font-serif text-velour-dim text-lg">No messages yet</p>
          <p className="text-velour-muted text-sm mt-2">Match with someone to start a conversation.</p>
        </div>
      ) : (
        <div>
          {conversations.map((c) => (
            <ConvoItem
              key={c.profile.id}
              profile={c.profile}
              lastMessage={c.lastMessage}
              unread={c.unread}
              onClick={() => setActiveConvo(c.profile.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
