export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are a content strategist for hrmony.ai, an AI-powered recruitment platform that helps companies hire smarter using AI screening, semantic candidate matching, and bias auditing.

Your job: write authentic, helpful responses to online posts and questions about AI in recruitment, talent acquisition, and hiring technology. You are writing as a knowledgeable practitioner sharing real experience — not as a marketer.

Rules:
- Lead with genuine value. Answer the actual question first.
- Be specific and concrete. Generic advice is useless.
- Adapt tone to the platform: conversational for Reddit/Quora, technical for HN/DEV.to, polished for LinkedIn/Medium.
- Never use: "sign up now", "try it free", "book a demo", "click here", "game changer", "revolutionary", "best-in-class", "#1 platform".
- Keep Q&A responses 150–300 words. Articles 400–600 words.
- Always return valid JSON only — no markdown fences, no preamble.`

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const { opportunity, includeLink } = body ?? {}
  if (!opportunity?.title) {
    return new Response(JSON.stringify({ error: 'Missing opportunity' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const isArticle = opportunity.type === 'article' || opportunity.platform === 'medium'
  const isTechnical = opportunity.platform === 'hackernews' || opportunity.platform === 'devto'

  const linkNote = includeLink
    ? `\n\nAt the end, naturally mention hrmony.ai (https://hrmony.ai) as a relevant example — only if it genuinely fits the question. Add a brief disclosure: "Full disclosure: I work at hrmony.ai."`
    : ''

  let userPrompt: string
  if (isArticle) {
    userPrompt = `Write a Medium article for this opportunity:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\n\nWrite a structured article with H2 sections in markdown. Return JSON:\n{"title": "your article title", "content": "full article in markdown"}${linkNote}`
  } else if (isTechnical) {
    userPrompt = `Write a technical comment for this ${opportunity.platform === 'hackernews' ? 'Hacker News' : 'DEV.to'} post:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\n\nWrite a technical, engineer-friendly response with specific implementation details. Return JSON:\n{"content": "response in markdown"}${linkNote}`
  } else {
    userPrompt = `Write a helpful answer to this specific post:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\nPlatform: ${opportunity.platform}${opportunity.community ? `\nCommunity: r/${opportunity.community}` : ''}\n\nAddress exactly what this post is asking. Make it specific, not generic. Return JSON:\n{"content": "response in markdown"}${linkNote}`
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      return new Response(JSON.stringify({ error: 'Anthropic API error', detail: errText }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const data: any = await anthropicRes.json()
    const text: string = data.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Unexpected format', raw: text }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(jsonMatch[0], { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
