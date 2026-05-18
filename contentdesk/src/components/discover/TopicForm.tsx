import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Input, Badge } from '../ui'
import { useStore } from '../../store'
import { discover } from '../../lib/discovery'
import type { Platform, Topic } from '../../types'

const PLATFORMS: { id: Platform; label: string; desc: string }[] = [
  { id: 'linkedin',   label: 'LinkedIn',    desc: 'Posts & articles' },
  { id: 'reddit',     label: 'Reddit',      desc: 'r/recruiting, r/humanresources' },
  { id: 'quora',      label: 'Quora',       desc: 'Questions & answers' },
  { id: 'medium',     label: 'Medium',      desc: 'Article opportunities' },
  { id: 'hackernews', label: 'Hacker News', desc: 'Tech discussions' },
  { id: 'devto',      label: 'DEV.to',      desc: 'Developer content' },
]

const SUGGESTED = [
  'AI recruitment',
  'candidate screening automation',
  'skills-based hiring',
  'AI bias in hiring',
  'ATS AI integration',
  'talent acquisition technology',
]

export const TopicForm = () => {
  const { topics, activeTopic, addTopic, removeTopic, setActiveTopic, setOpportunities, setIsDiscovering } = useStore()
  const [keyword, setKeyword] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>(['linkedin', 'reddit', 'quora'])
  const [running, setRunning] = useState(false)

  const toggle = (p: Platform) => setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  const run = async (topic?: Topic) => {
    const t = topic ?? {
      id: crypto.randomUUID(),
      keyword: keyword.trim(),
      platforms,
      created_at: new Date().toISOString(),
    }
    if (!topic && keyword.trim()) addTopic(t)
    setActiveTopic(t)
    setIsDiscovering(true)
    setRunning(true)
    try {
      const opps = await discover(t)
      setOpportunities(opps)
    } finally {
      setIsDiscovering(false)
      setRunning(false)
      if (!topic) setKeyword('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-ink-5 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink mb-0.5">Keyword or topic</h2>
          <p className="text-xs text-ink-3 mb-3">What subject should hrmony.ai be known for?</p>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="e.g. AI candidate screening, skills-based hiring…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && keyword.trim() && platforms.length && run()}
            />
            <Button onClick={() => run()} loading={running} disabled={!keyword.trim() || !platforms.length}>
              Discover
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => setKeyword(s)} className="text-xs px-2.5 py-1 rounded-full border border-ink-5 text-ink-3 hover:border-brand-400 hover:text-brand-600 transition-all">
              {s}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-ink-3 mb-2">Platforms to search</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PLATFORMS.map(({ id, label, desc }) => {
              const active = platforms.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={clsx(
                    'flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all',
                    active ? 'border-brand-500 bg-brand-50 text-ink' : 'border-ink-5 bg-surface-1 text-ink-3 hover:border-ink-4',
                  )}
                >
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[11px] text-ink-4 mt-0.5">{desc}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {topics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">Saved topics</p>
          <div className="space-y-1.5">
            {topics.map((t) => (
              <div
                key={t.id}
                className={clsx(
                  'flex items-center justify-between px-4 py-2.5 rounded-lg border bg-white transition-all',
                  activeTopic?.id === t.id ? 'border-brand-400 shadow-sm' : 'border-ink-5 hover:border-ink-4',
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm text-ink truncate">{t.keyword}</span>
                  <div className="flex gap-1 flex-wrap">
                    {t.platforms.map((p) => <Badge key={p}>{p}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-1.5 ml-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => run(t)} loading={running && activeTopic?.id === t.id}>Run</Button>
                  <Button variant="ghost" size="sm" onClick={() => removeTopic(t.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">×</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
        <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          Every draft requires human approval before publishing. No content is posted automatically. Platform compliance rules are checked on every draft.
        </p>
      </div>
    </div>
  )
}
