import { useState } from 'react'
import { Card, Button, Input } from '../ui'
import { useStore } from '../../store'
import type { Post } from '../../types'
import { PLATFORM_META } from '../../types'
import { clsx } from 'clsx'

const Stat = ({ label, value, sub }: { label: string; value: number | string; sub?: string }) => (
  <div className="text-center">
    <p className="text-2xl font-semibold text-ink">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-xs text-ink-4 mt-0.5">{label}</p>
    {sub && <p className="text-[11px] text-ink-5 mt-0.5">{sub}</p>}
  </div>
)

const PublishModal = ({ draftId, onClose }: { draftId: string; onClose: () => void }) => {
  const { publishDraft } = useStore()
  const [url, setUrl] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-ink-5 p-6 w-full max-w-md space-y-4">
        <div>
          <p className="font-semibold text-ink mb-1">Mark as Published</p>
          <p className="text-sm text-ink-3">Enter the URL after manually posting the content. This tool never posts automatically.</p>
        </div>
        <Input label="Published URL" placeholder="https://linkedin.com/posts/…" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && url.trim() && (publishDraft(draftId, url.trim()), onClose())} />
        <div className="flex gap-2">
          <Button onClick={() => { publishDraft(draftId, url.trim()); onClose() }} disabled={!url.trim()}>Confirm</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

const StatsModal = ({ post, onClose }: { post: Post; onClose: () => void }) => {
  const { updatePostStats } = useStore()
  const [views,   setViews]   = useState(String(post.views))
  const [clicks,  setClicks]  = useState(String(post.clicks))
  const [upvotes, setUpvotes] = useState(String(post.upvotes))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-ink-5 p-6 w-full max-w-sm space-y-4">
        <div>
          <p className="font-semibold text-ink mb-1">Update Stats</p>
          <p className="text-xs text-ink-3 line-clamp-1">{post.opportunity_title}</p>
        </div>
        <p className="text-xs text-ink-4">Enter numbers from the platform manually — most don't expose public APIs.</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Views"   type="number" min="0" value={views}   onChange={(e) => setViews(e.target.value)} />
          <Input label="Clicks"  type="number" min="0" value={clicks}  onChange={(e) => setClicks(e.target.value)} />
          <Input label="Upvotes" type="number" min="0" value={upvotes} onChange={(e) => setUpvotes(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { updatePostStats(post.id, { views: +views || 0, clicks: +clicks || 0, upvotes: +upvotes || 0 }); onClose() }}>Save</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

const PostCard = ({ post }: { post: Post }) => {
  const [showStats, setShowStats] = useState(false)
  const meta = PLATFORM_META[post.platform]
  return (
    <>
      {showStats && <StatsModal post={post} onClose={() => setShowStats(false)} />}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink line-clamp-1">{post.opportunity_title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded', meta.bg, meta.color)}>{meta.name}</span>
              <span className="text-xs text-ink-4">{new Date(post.published_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded border border-ink-5 text-ink-3 hover:text-brand-600 hover:border-brand-400 transition-all">View</a>
            <button onClick={() => setShowStats(true)} className="text-xs px-2.5 py-1 rounded border border-ink-5 text-ink-3 hover:text-brand-600 hover:border-brand-400 transition-all">Update stats</button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-5 bg-surface-1 rounded-lg py-3 px-2">
          <Stat label="Views"   value={post.views} />
          <Stat label="Clicks"  value={post.clicks} />
          <Stat label="Upvotes" value={post.upvotes} />
        </div>
        <p className="text-[11px] text-ink-5 text-right mt-1.5">Updated {new Date(post.last_updated).toLocaleDateString()}</p>
      </Card>
    </>
  )
}

export const PerformanceTracker = () => {
  const { posts, drafts } = useStore()
  const [publishTarget, setPublishTarget] = useState<string | null>(null)

  const approved = drafts.filter((d) => d.status === 'approved')
  const totalViews   = posts.reduce((s, p) => s + p.views, 0)
  const totalClicks  = posts.reduce((s, p) => s + p.clicks, 0)
  const totalUpvotes = posts.reduce((s, p) => s + p.upvotes, 0)

  return (
    <>
      {publishTarget && <PublishModal draftId={publishTarget} onClose={() => setPublishTarget(null)} />}

      <div className="space-y-6">
        {posts.length > 0 && (
          <Card className="p-5">
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-4">All-time Performance</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Posts"   value={posts.length} />
              <Stat label="Views"   value={totalViews} />
              <Stat label="Clicks"  value={totalClicks} />
              <Stat label="Upvotes" value={totalUpvotes} />
            </div>
          </Card>
        )}

        {approved.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Ready to Publish ({approved.length})</p>
            <div className="mb-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              ⚠ These drafts are approved. Post them manually on the platform, then record the URL here.
            </div>
            <div className="space-y-2">
              {approved.map((d) => {
                const meta = PLATFORM_META[d.platform]
                return (
                  <Card key={d.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink line-clamp-1">{d.title || d.opportunity.title}</p>
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block', meta.bg, meta.color)}>{meta.name}</span>
                    </div>
                    <Button size="sm" onClick={() => setPublishTarget(d.id)}>Mark Published</Button>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Published Posts ({posts.length})</p>
            <div className="space-y-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </section>
        )}

        {posts.length === 0 && approved.length === 0 && (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-medium text-ink-3">No published posts yet</p>
            <p className="text-xs text-ink-4">Approved drafts will appear here for publishing.</p>
          </div>
        )}
      </div>
    </>
  )
}
