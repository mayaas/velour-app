import type { MarketingOpportunity, MarketingPlatform, MarketingTopic } from '../../types/marketing'

// ─── Relevance Scoring ────────────────────────────────────────────────────────

function scoreRelevance(keyword: string, title: string, body: string, upvotes = 0, replyCount = 0): number {
  const kw = keyword.toLowerCase()
  const titleLower = title.toLowerCase()
  const bodyLower = body.toLowerCase()

  const titleMatch = titleLower.includes(kw) ? 0.4 : titleLower.split(' ').some((w) => kw.includes(w) && w.length > 3) ? 0.2 : 0
  const bodyMatch = bodyLower.includes(kw) ? 0.2 : 0.05
  const engagementScore = Math.min((upvotes + replyCount * 2) / 200, 0.25)
  const recencyBonus = 0.15

  return Math.min(titleMatch + bodyMatch + engagementScore + recencyBonus, 1)
}

// ─── Mock Discovery ───────────────────────────────────────────────────────────
// In production, each platform function would call a real public API or RSS feed:
//   Reddit   → https://www.reddit.com/search.json?q=<keyword>&sort=new
//   HN       → https://hn.algolia.com/api/v1/search?query=<keyword>&tags=ask_hn
//   DEV.to   → https://dev.to/api/articles?tag=<keyword>
//   Medium   → RSS feed for tag: https://medium.com/feed/tag/<keyword>
//   Quora    → No public API; manual curation or Google CSE
//   LinkedIn → LinkedIn API (requires OAuth + approval)
//   Forums   → Google CSE restricted to known forum domains

function generateRedditOpportunities(keyword: string, topicId: string): MarketingOpportunity[] {
  const subreddits = ['relationships', 'dating', 'dating_advice', 'polyamory', 'sex', 'AskMen', 'AskWomen', 'relationship_advice']
  const questions = [
    { title: `How do I communicate boundaries with a new partner?`, body: `I've been seeing someone for about a month and we haven't had the "what are we" talk. How do you bring up important ${keyword} boundaries without it being awkward?`, upvotes: 142, replies: 38 },
    { title: `Best apps/tools for ${keyword} in modern dating?`, body: `Looking for recommendations. I'm tired of the swipe-and-ghost culture and want something more intentional.`, upvotes: 89, replies: 24 },
    { title: `How do you handle mismatched expectations around ${keyword}?`, body: `My partner and I have different views. We've talked but keep having the same argument. Looking for advice on how to navigate this respectfully.`, upvotes: 67, replies: 51 },
    { title: `Is it normal to feel anxious about ${keyword} conversations?`, body: `Every time I try to bring this up I freeze. My therapist says avoidant attachment. Anyone else relate?`, upvotes: 203, replies: 112 },
    { title: `Resources for understanding ${keyword} in relationships?`, body: `Any books, podcasts, or articles you'd recommend? Trying to be more educated before my next serious relationship.`, upvotes: 55, replies: 29 },
  ]

  return questions.map((q, i) => {
    const sub = subreddits[i % subreddits.length]
    const score = scoreRelevance(keyword, q.title, q.body, q.upvotes, q.replies)
    return {
      id: crypto.randomUUID(),
      topic_id: topicId,
      platform: 'reddit' as MarketingPlatform,
      title: q.title,
      url: `https://reddit.com/r/${sub}/comments/example${i}`,
      body_snippet: q.body,
      relevance_score: parseFloat(score.toFixed(2)),
      opportunity_type: 'question',
      discovered_at: new Date(Date.now() - i * 3_600_000).toISOString(),
      status: 'new',
      author: `user_${Math.floor(Math.random() * 9000 + 1000)}`,
      upvotes: q.upvotes,
      reply_count: q.replies,
      subreddit: sub,
    }
  })
}

function generateQuoraOpportunities(keyword: string, topicId: string): MarketingOpportunity[] {
  const questions = [
    { title: `What is the best way to approach ${keyword} with a potential partner?`, body: `I'm new to navigating ${keyword} and would love advice from people who've done it thoughtfully. What worked for you?`, upvotes: 312, replies: 18 },
    { title: `How has technology changed ${keyword} in dating?`, body: `With so many apps and platforms, I wonder how the landscape has shifted and whether any tools genuinely help.`, upvotes: 178, replies: 9 },
    { title: `What are the most important aspects of ${keyword} for long-term relationship success?`, body: `Looking for research-backed answers or personal experience. What actually matters?`, upvotes: 445, replies: 23 },
  ]

  return questions.map((q, i) => ({
    id: crypto.randomUUID(),
    topic_id: topicId,
    platform: 'quora' as MarketingPlatform,
    title: q.title,
    url: `https://quora.com/What-is-the-best-way-to-approach-${keyword.replace(/\s+/g, '-')}-${i}`,
    body_snippet: q.body,
    relevance_score: parseFloat(scoreRelevance(keyword, q.title, q.body, q.upvotes, q.replies).toFixed(2)),
    opportunity_type: 'question',
    discovered_at: new Date(Date.now() - i * 86_400_000).toISOString(),
    status: 'new',
    author: `Quora User`,
    upvotes: q.upvotes,
    reply_count: q.replies,
  }))
}

function generateMediumOpportunities(keyword: string, topicId: string): MarketingOpportunity[] {
  const articles = [
    { title: `The Psychology Behind ${keyword} in Modern Relationships`, body: `Trending topic with 2.4k reads this week. Publication actively seeking expert contributors on this subject.`, upvotes: 198, replies: 14 },
    { title: `Write for Us: ${keyword} and Emotional Intelligence`, body: `Medium publication "Modern Love & Tech" is accepting pitches on ${keyword}, attachment styles, and digital dating.`, upvotes: 67, replies: 5 },
  ]

  return articles.map((a, i) => ({
    id: crypto.randomUUID(),
    topic_id: topicId,
    platform: 'medium' as MarketingPlatform,
    title: a.title,
    url: `https://medium.com/@example/the-psychology-behind-${keyword.replace(/\s+/g, '-')}-${i}`,
    body_snippet: a.body,
    relevance_score: parseFloat(scoreRelevance(keyword, a.title, a.body, a.upvotes, a.replies).toFixed(2)),
    opportunity_type: 'article_prompt',
    discovered_at: new Date(Date.now() - i * 7_200_000).toISOString(),
    status: 'new',
    upvotes: a.upvotes,
    reply_count: a.replies,
  }))
}

function generateHNOpportunities(keyword: string, topicId: string): MarketingOpportunity[] {
  const threads = [
    { title: `Ask HN: How do you handle ${keyword} in modern dating apps?`, body: `I've been thinking about how tech platforms approach this. Most seem to ignore it entirely. Are there any that do it well?`, upvotes: 89, replies: 42 },
    { title: `The engineering challenge of building ${keyword} features responsibly`, body: `Discussion thread about product design and ethics in dating/relationship apps. Active with 40+ comments.`, upvotes: 134, replies: 61 },
  ]

  return threads.map((t, i) => ({
    id: crypto.randomUUID(),
    topic_id: topicId,
    platform: 'hackernews' as MarketingPlatform,
    title: t.title,
    url: `https://news.ycombinator.com/item?id=4000000${i}`,
    body_snippet: t.body,
    relevance_score: parseFloat(scoreRelevance(keyword, t.title, t.body, t.upvotes, t.replies).toFixed(2)),
    opportunity_type: 'discussion',
    discovered_at: new Date(Date.now() - i * 5_400_000).toISOString(),
    status: 'new',
    upvotes: t.upvotes,
    reply_count: t.replies,
  }))
}

function generateDevToOpportunities(keyword: string, topicId: string): MarketingOpportunity[] {
  return [
    {
      id: crypto.randomUUID(),
      topic_id: topicId,
      platform: 'devto' as MarketingPlatform,
      title: `Building ${keyword} features for dating apps — what developers get wrong`,
      url: `https://dev.to/example/building-${keyword.replace(/\s+/g, '-')}-features`,
      body_snippet: `Popular article with 1.8k reactions. Comment section actively discussing UX patterns, privacy, and ethical design. Great opportunity for a thoughtful technical perspective.`,
      relevance_score: parseFloat(scoreRelevance(keyword, `Building ${keyword} features for dating apps`, '', 180, 55).toFixed(2)),
      opportunity_type: 'discussion',
      discovered_at: new Date(Date.now() - 10_800_000).toISOString(),
      status: 'new',
      upvotes: 180,
      reply_count: 55,
    },
  ]
}

// ─── Main Discovery Function ──────────────────────────────────────────────────

export async function discoverOpportunities(topic: MarketingTopic): Promise<MarketingOpportunity[]> {
  // Simulates parallel fetching from multiple platforms.
  // In production, replace each generator with a real API call.
  await new Promise((r) => setTimeout(r, 1200))

  const all: MarketingOpportunity[] = []
  const { keyword, id, platforms } = topic

  if (platforms.includes('reddit')) all.push(...generateRedditOpportunities(keyword, id))
  if (platforms.includes('quora')) all.push(...generateQuoraOpportunities(keyword, id))
  if (platforms.includes('medium')) all.push(...generateMediumOpportunities(keyword, id))
  if (platforms.includes('hackernews')) all.push(...generateHNOpportunities(keyword, id))
  if (platforms.includes('devto')) all.push(...generateDevToOpportunities(keyword, id))

  return all.sort((a, b) => b.relevance_score - a.relevance_score)
}
