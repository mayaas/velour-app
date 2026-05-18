import type { Opportunity, Platform, Topic } from '../../types'

function score(keyword: string, title: string, body: string, upvotes = 0, replies = 0): number {
  const kw = keyword.toLowerCase()
  const t = title.toLowerCase()
  const b = body.toLowerCase()

  const titleExact   = t.includes(kw) ? 0.38 : 0
  const titlePartial = !titleExact && kw.split(' ').some((w) => w.length > 3 && t.includes(w)) ? 0.18 : 0
  const bodyMatch    = b.includes(kw) ? 0.18 : 0.05
  const engagement   = Math.min((upvotes + replies * 1.5) / 300, 0.22)
  const recency      = 0.17

  return Math.min(parseFloat((titleExact + titlePartial + bodyMatch + engagement + recency).toFixed(2)), 1)
}

const LINKEDIN_POOL = [
  { title: 'How is AI actually changing the recruitment process in 2025?', snippet: 'Article with 4.2k reactions. Comment thread asking for practitioner perspectives on what AI tools genuinely automate vs. what still needs humans.' },
  { title: 'The skills-based hiring revolution: hype or reality?', snippet: 'Discussion post with 680 comments. HR leaders debating whether AI screening tools are accelerating or obstructing skills-based approaches.' },
  { title: 'AI bias in hiring — are we solving the problem or making it worse?', snippet: 'Post by a CHRO with 1.1k comments. Asking for examples of audited, explainable AI systems in recruitment.' },
  { title: 'Which ATS platforms are actually integrating AI effectively in 2025?', snippet: "Practitioners sharing reviews. Several comments asking for vendor-neutral comparisons from people who've run pilots." },
  { title: 'Time-to-hire dropped 40% after adopting AI screening — our experience', snippet: 'Case study post asking: "What metrics are others tracking after AI adoption? Quality-of-hire? Diversity rates?"' },
  { title: 'Is ChatGPT a threat to recruiters or a superpower?', snippet: 'Poll + discussion with 3k votes. Comments request concrete examples of AI augmenting recruiters, not replacing them.' },
]

const REDDIT_POOL = [
  { title: 'How do you handle AI-generated CVs as a recruiter?', snippet: 'r/recruiting — 287 upvotes. Recruiters asking for tools or techniques to identify AI-generated applications and assess genuine fit.', community: 'recruiting', upvotes: 287, replies: 94 },
  { title: 'Best AI tools for sourcing candidates in 2025?', snippet: 'r/humanresources — 156 upvotes. TA teams asking for recommendations beyond LinkedIn Recruiter. Practical tool reviews wanted.', community: 'humanresources', upvotes: 156, replies: 61 },
  { title: 'Our company wants to use AI for initial screening — ethical concerns?', snippet: 'r/recruiting — 412 upvotes. Recruiter raising concerns about bias, transparency, and candidate experience with AI screening.', community: 'recruiting', upvotes: 412, replies: 138 },
  { title: 'Has anyone actually measured quality-of-hire improvement after adding AI?', snippet: 'r/humanresources — 203 upvotes. Looking for real data, not vendor case studies.', community: 'humanresources', upvotes: 203, replies: 55 },
  { title: 'What does an AI-powered recruitment workflow actually look like end-to-end?', snippet: 'r/recruiting — 178 upvotes. Junior recruiter asking for a realistic picture of how AI fits into the process.', community: 'recruiting', upvotes: 178, replies: 72 },
]

const QUORA_POOL = [
  { title: 'What are the best AI tools for recruiting and talent acquisition in 2025?', snippet: 'Question with 48k views. Top answers are outdated. Space for a current, practitioner answer.', upvotes: 891, replies: 34 },
  { title: 'How does AI improve candidate matching beyond keyword search?', snippet: 'Question with 22k views. Technically shallow answers. Room for an explanation of semantic matching and structured signals.', upvotes: 445, replies: 18 },
  { title: 'Can AI eliminate bias in hiring, or does it amplify it?', snippet: 'Question with 67k views. No answer from an AI-in-recruitment practitioner who has run audits.', upvotes: 1240, replies: 52 },
]

const MEDIUM_POOL = [
  { title: 'Write for us: The Future of AI in Talent Acquisition', snippet: '"Future of Work" publication on Medium actively seeking expert contributors. 28k subscribers. Topics: AI screening, bias auditing, candidate experience.' },
  { title: 'Article opportunity: Skills-based hiring + AI — what the data shows', snippet: '"HR Tech Insider" is curating data-driven pieces on AI recruitment outcomes. Ideal for a Harmonai perspective backed by customer data.' },
]

const HN_POOL = [
  { title: 'Ask HN: How are companies actually using AI in recruiting right now?', snippet: '189 comments. Engineers and founders sharing experiences. Practitioner insights from the AI side are underrepresented.', upvotes: 312, replies: 189 },
  { title: 'Show HN: We built an AI that explains its hiring recommendations', snippet: 'Discussion about explainability in AI hiring tools. Comment thread asking for production examples.', upvotes: 267, replies: 143 },
]

const DEVTO_POOL = [
  { title: 'Building fair AI screening systems — a technical deep dive', snippet: '2.1k reactions. Comment thread asking how to implement bias auditing in ML pipelines used for recruitment.' },
]

function makeOpportunities(
  pool: { title: string; snippet: string; community?: string; upvotes?: number; replies?: number }[],
  platform: Platform,
  topicId: string,
  keyword: string,
  urlBase: string,
  type: Opportunity['type'],
): Opportunity[] {
  return pool.map((item, i) => ({
    id: crypto.randomUUID(),
    topic_id: topicId,
    platform,
    title: item.title,
    url: `${urlBase}/${i}`,
    snippet: item.snippet,
    relevance_score: score(keyword, item.title, item.snippet, item.upvotes, item.replies),
    type,
    community: item.community,
    author: platform === 'quora' ? 'Quora User' : undefined,
    upvotes: item.upvotes,
    replies: item.replies,
    discovered_at: new Date(Date.now() - i * 4_200_000).toISOString(),
    status: 'new' as const,
  }))
}

export async function discover(topic: Topic): Promise<Opportunity[]> {
  await new Promise((r) => setTimeout(r, 1400))

  const { id, keyword, platforms } = topic
  const all: Opportunity[] = []

  if (platforms.includes('linkedin'))
    all.push(...makeOpportunities(LINKEDIN_POOL, 'linkedin', id, keyword, 'https://linkedin.com/posts', 'discussion'))

  if (platforms.includes('reddit'))
    all.push(...makeOpportunities(REDDIT_POOL, 'reddit', id, keyword, 'https://reddit.com/r/recruiting/comments', 'question'))

  if (platforms.includes('quora'))
    all.push(...makeOpportunities(QUORA_POOL, 'quora', id, keyword, 'https://quora.com/q', 'question'))

  if (platforms.includes('medium'))
    all.push(...makeOpportunities(MEDIUM_POOL, 'medium', id, keyword, 'https://medium.com/@harmonai', 'article'))

  if (platforms.includes('hackernews'))
    all.push(...makeOpportunities(HN_POOL, 'hackernews', id, keyword, 'https://news.ycombinator.com/item', 'discussion'))

  if (platforms.includes('devto'))
    all.push(...makeOpportunities(DEVTO_POOL, 'devto', id, keyword, 'https://dev.to/harmonai', 'article'))

  return all.sort((a, b) => b.relevance_score - a.relevance_score)
}
