import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Input, Badge, SectionLabel } from '../ui'
import { useMarketingStore } from '../../store/marketing'
import { discoverOpportunities } from '../../lib/marketing/discovery'
import type { MarketingPlatform, MarketingTopic } from '../../types/marketing'

const PLATFORMS: { id: MarketingPlatform; label: string; desc: string }[] = [
  { id: 'reddit', label: 'Reddit', desc: 'Public Q&A threads' },
  { id: 'quora', label: 'Quora', desc: 'Expert question answers' },
  { id: 'medium', label: 'Medium', desc: 'Article opportunities' },
  { id: 'hackernews', label: 'Hacker News', desc: 'Tech discussions' },
  { id: 'devto', label: 'DEV.to', desc: 'Developer articles' },
  { id: 'forum', label: 'Forums', desc: 'Niche communities' },
]

export const TopicSearch = () => {
  const { topics, activeTopic, addTopic, removeTopic, setActiveTopic, setOpportunities, setIsDiscovering, setDiscoveryError } = useMarketingStore()
  const [keyword, setKeyword] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<MarketingPlatform[]>(['reddit', 'quora', 'medium', 'hackernews'])
  const [isRunning, setIsRunning] = useState(false)

  const togglePlatform = (p: MarketingPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleDiscover = async (topic?: MarketingTopic) => {
    const target = topic ?? {
      id: crypto.randomUUID(),
      keyword: keyword.trim(),
      description: description.trim() || undefined,
      platforms: selectedPlatforms,
      created_at: new Date().toISOString(),
    }

    if (!topic && keyword.trim()) {
      addTopic(target)
    }

    setActiveTopic(target)
    setIsDiscovering(true)
    setDiscoveryError(null)
    setIsRunning(true)

    try {
      const opps = await discoverOpportunities(target)
      setOpportunities(opps)
    } catch {
      setDiscoveryError('Discovery failed. Check your connection and try again.')
    } finally {
      setIsDiscovering(false)
      setIsRunning(false)
      if (!topic) {
        setKeyword('')
        setDescription('')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* New Topic Form */}
      <div>
        <SectionLabel>New Topic Search</SectionLabel>
        <div className="space-y-4">
          <Input
            label="Keyword or Topic"
            placeholder="e.g. relationship boundaries, attachment styles, dating safety"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && keyword.trim() && selectedPlatforms.length > 0 && handleDiscover()}
          />
          <Input
            label="Description (optional)"
            placeholder="What kind of content are you looking for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Platform Selector */}
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-velour-dim mb-3">Platforms to search</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.map(({ id, label, desc }) => {
                const active = selectedPlatforms.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={clsx(
                      'flex flex-col items-start px-4 py-3 border text-left transition-all duration-200',
                      active
                        ? 'border-[rgba(201,160,122,0.5)] bg-[rgba(201,160,122,0.06)] text-velour-dim'
                        : 'border-[rgba(185,150,90,0.14)] bg-bg-2 text-velour-muted hover:border-[rgba(185,150,90,0.3)]'
                    )}
                  >
                    <span className="text-[10px] tracking-[0.15em] uppercase font-medium">{label}</span>
                    <span className="text-[10px] text-velour-muted mt-0.5">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            onClick={() => handleDiscover()}
            loading={isRunning}
            disabled={!keyword.trim() || selectedPlatforms.length === 0}
            className="w-full"
          >
            Discover Opportunities
          </Button>
        </div>
      </div>

      {/* Saved Topics */}
      {topics.length > 0 && (
        <div>
          <SectionLabel>Saved Topics</SectionLabel>
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={clsx(
                  'flex items-center justify-between px-4 py-3 border transition-all duration-200',
                  activeTopic?.id === topic.id
                    ? 'border-[rgba(201,160,122,0.45)] bg-[rgba(201,160,122,0.05)]'
                    : 'border-[rgba(185,150,90,0.14)] bg-bg-2 hover:border-[rgba(185,150,90,0.3)]'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-velour-dim truncate">{topic.keyword}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {topic.platforms.map((p) => (
                      <Badge key={p} variant="ghost">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDiscover(topic)}
                    loading={isRunning && activeTopic?.id === topic.id}
                  >
                    Run
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeTopic(topic.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance notice */}
      <div className="border border-[rgba(185,150,90,0.14)] bg-bg-2 px-5 py-4">
        <p className="text-[9px] tracking-[0.2em] uppercase text-rose mb-2">Compliance First</p>
        <p className="text-[11px] text-velour-muted leading-relaxed">
          This tool discovers public opportunities for genuinely helpful content. Every draft must be reviewed and approved by a human before publishing. No auto-posting. Platform rules are enforced at the draft stage.
        </p>
      </div>
    </div>
  )
}
