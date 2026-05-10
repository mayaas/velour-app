import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Card, SectionLabel, Input, Badge } from '../ui'
import { useMarketingStore } from '../../store/marketing'
import type { MarketingPlatform, MarketingPost } from '../../types/marketing'

const PLATFORM_LABELS: Record<MarketingPlatform, string> = {
  reddit: 'Reddit',
  quora: 'Quora',
  medium: 'Medium',
  linkedin: 'LinkedIn',
  hackernews: 'Hacker News',
  devto: 'DEV.to',
  forum: 'Forum',
}

const StatCell = ({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) => (
  <div className="text-center">
    <p className={clsx('text-lg font-light', highlight ? 'text-rose' : 'text-velour-dim')}>{value}</p>
    <p className="text-[9px] tracking-[0.2em] uppercase text-velour-muted mt-0.5">{label}</p>
  </div>
)

const PublishModal = ({ draftId, onClose }: { draftId: string; onClose: () => void }) => {
  const { publishDraft } = useMarketingStore()
  const [url, setUrl] = useState('')

  const handlePublish = () => {
    if (!url.trim()) return
    publishDraft(draftId, url.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4">
      <div className="bg-bg-2 border border-[rgba(185,150,90,0.25)] p-6 w-full max-w-md space-y-5">
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-rose mb-1">Mark as Published</p>
          <p className="text-sm text-velour-dim font-light">Enter the URL where this content was posted after human review and manual publishing.</p>
        </div>
        <Input
          label="Published URL"
          placeholder="https://reddit.com/r/example/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
        />
        <div className="border border-amber-400/20 bg-amber-400/3 px-4 py-3">
          <p className="text-[10px] text-amber-400">
            ⚠ Only mark as published after you have manually posted the approved content. This tool does not post automatically.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePublish} disabled={!url.trim()}>Confirm</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

const UpdateStatsModal = ({ post, onClose }: { post: MarketingPost; onClose: () => void }) => {
  const { updatePostStats } = useMarketingStore()
  const [views, setViews] = useState(String(post.views))
  const [clicks, setClicks] = useState(String(post.clicks))
  const [upvotes, setUpvotes] = useState(String(post.upvotes))

  const handleSave = () => {
    updatePostStats(post.id, {
      views: parseInt(views) || 0,
      clicks: parseInt(clicks) || 0,
      upvotes: parseInt(upvotes) || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4">
      <div className="bg-bg-2 border border-[rgba(185,150,90,0.25)] p-6 w-full max-w-md space-y-5">
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-rose mb-1">Update Performance</p>
          <p className="text-sm text-velour-dim font-light line-clamp-1">{post.opportunity_title}</p>
        </div>
        <p className="text-[11px] text-velour-muted">Manually enter stats from the platform. Most platforms don't provide public APIs for this data.</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Views" type="number" min="0" value={views} onChange={(e) => setViews(e.target.value)} />
          <Input label="Clicks" type="number" min="0" value={clicks} onChange={(e) => setClicks(e.target.value)} />
          <Input label="Upvotes" type="number" min="0" value={upvotes} onChange={(e) => setUpvotes(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

const PostRow = ({ post, onPublish }: { post: MarketingPost & { status?: string }; onPublish?: () => void }) => {
  const [showStats, setShowStats] = useState(false)

  return (
    <>
      {showStats && <UpdateStatsModal post={post} onClose={() => setShowStats(false)} />}
      <Card hover className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-velour-dim font-light line-clamp-1">{post.opportunity_title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="ghost">{PLATFORM_LABELS[post.platform]}</Badge>
              <span className="text-[10px] text-velour-muted">{new Date(post.published_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] tracking-[0.15em] uppercase text-velour-muted border border-[rgba(185,150,90,0.14)] px-3 py-1.5 hover:text-rose-light transition-colors"
            >
              View Post
            </a>
            <button
              onClick={() => setShowStats(true)}
              className="text-[9px] tracking-[0.15em] uppercase text-velour-muted border border-[rgba(185,150,90,0.14)] px-3 py-1.5 hover:text-rose-light transition-colors"
            >
              Update Stats
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[rgba(185,150,90,0.1)] bg-bg-3 py-3">
          <StatCell label="Views" value={post.views.toLocaleString()} />
          <StatCell label="Clicks" value={post.clicks.toLocaleString()} highlight />
          <StatCell label="Upvotes" value={post.upvotes.toLocaleString()} />
        </div>
        <div className="mt-2 text-[10px] text-velour-muted text-right">
          Last checked: {new Date(post.last_checked_at).toLocaleDateString()}
        </div>
      </Card>
    </>
  )
}

export const PerformanceTracker = () => {
  const { posts, drafts } = useMarketingStore()
  const [publishTarget, setPublishTarget] = useState<string | null>(null)

  const approvedUnpublished = drafts.filter((d) => d.status === 'approved')

  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const totalClicks = posts.reduce((s, p) => s + p.clicks, 0)
  const totalUpvotes = posts.reduce((s, p) => s + p.upvotes, 0)

  return (
    <>
      {publishTarget && (
        <PublishModal
          draftId={publishTarget}
          onClose={() => setPublishTarget(null)}
        />
      )}

      <div className="space-y-8">
        {/* Summary stats */}
        {posts.length > 0 && (
          <div>
            <SectionLabel>All-Time Performance</SectionLabel>
            <div className="grid grid-cols-3 divide-x divide-[rgba(185,150,90,0.1)] border border-[rgba(185,150,90,0.14)] bg-bg-2 py-5">
              <StatCell label="Total Views" value={totalViews.toLocaleString()} />
              <StatCell label="Total Clicks" value={totalClicks.toLocaleString()} highlight />
              <StatCell label="Total Upvotes" value={totalUpvotes.toLocaleString()} />
            </div>
            <div className="grid grid-cols-2 divide-x divide-[rgba(185,150,90,0.1)] border border-t-0 border-[rgba(185,150,90,0.14)] bg-bg-2 py-4">
              <StatCell label="Posts Published" value={posts.length} />
              <StatCell label="Platforms" value={new Set(posts.map((p) => p.platform)).size} />
            </div>
          </div>
        )}

        {/* Approved, ready to publish */}
        {approvedUnpublished.length > 0 && (
          <div>
            <SectionLabel>Ready to Publish ({approvedUnpublished.length})</SectionLabel>
            <div className="border border-amber-400/20 bg-amber-400/3 px-4 py-3 mb-4">
              <p className="text-[10px] text-amber-400">
                These drafts have been approved. You must manually post them to the platform, then record the URL here to track performance. This tool never posts automatically.
              </p>
            </div>
            <div className="space-y-3">
              {approvedUnpublished.map((d) => (
                <Card key={d.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-velour-dim font-light line-clamp-1">{d.title || d.opportunity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="ghost">{PLATFORM_LABELS[d.platform]}</Badge>
                      <span className="text-emerald-400 text-[8px] tracking-[0.2em] uppercase border border-emerald-400/30 px-2 py-0.5">Approved</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setPublishTarget(d.id)}
                  >
                    Mark Published
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Published posts */}
        {posts.length > 0 && (
          <div>
            <SectionLabel>Published Posts ({posts.length})</SectionLabel>
            <div className="space-y-3">
              {posts.map((post) => <PostRow key={post.id} post={post} />)}
            </div>
          </div>
        )}

        {posts.length === 0 && approvedUnpublished.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <p className="text-velour-muted text-sm">No published posts yet.</p>
            <p className="text-[11px] text-velour-muted">Approved drafts will appear here ready to be manually published.</p>
          </div>
        )}
      </div>
    </>
  )
}
