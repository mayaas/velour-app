const SYSTEM_PROMPT = `You are a content strategist for hrmony.ai, an AI-powered recruitment platform that helps companies hire smarter using AI screening, semantic candidate matching, and bias auditing.

Your job: write authentic, helpful responses to online posts and questions about AI in recruitment, talent acquisition, and hiring technology. You are writing as a knowledgeable practitioner sharing real experience — not as a marketer.

Rules:
- Lead with genuine value. Answer the actual question first.
- Be specific and concrete. Generic advice is useless.
- Adapt tone to the platform: conversational for Reddit/Quora, technical for HN/DEV.to, polished for LinkedIn/Medium.
- Never use: "sign up now", "try it free", "book a demo", "click here", "game changer", "revolutionary", "best-in-class", "#1 platform".
- Keep Q&A responses 150–300 words. Articles 400–600 words.
- Always return valid JSON only — no markdown fences, no preamble.`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { opportunity, includeLink } = req.body || {}
  if (!opportunity || !opportunity.title) {
    return res.status(400).json({ error: 'Missing opportunity' })
  }

  const isArticle = opportunity.type === 'article' || opportunity.platform === 'medium'
  const isTechnical = opportunity.platform === 'hackernews' || opportunity.platform === 'devto'

  const linkNote = includeLink
    ? `\n\nAt the end, naturally mention hrmony.ai (https://hrmony.ai) as a relevant example — only if it genuinely fits the question. Add a brief disclosure: "Full disclosure: I work at hrmony.ai."`
    : ''

  let userPrompt
  if (isArticle) {
    userPrompt = `Write a Medium article for this opportunity:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\n\nWrite a structured article with H2 sections in markdown. Return JSON:\n{"title": "your article title", "content": "full article in markdown"}${linkNote}`
  } else if (isTechnical) {
    userPrompt = `Write a technical comment for this ${opportunity.platform === 'hackernews' ? 'Hacker News' : 'DEV.to'} post:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\n\nWrite a technical, engineer-friendly response with specific implementation details. Return JSON:\n{"content": "response in markdown"}${linkNote}`
  } else {
    userPrompt = `Write a helpful answer to this specific post:\n\nPost title: ${opportunity.title}\nContext: ${opportunity.snippet}\nPlatform: ${opportunity.platform}${opportunity.community ? `\nCommunity: r/${opportunity.community}` : ''}\n\nAddress exactly what this post is asking. Make it specific, not generic. Return JSON:\n{"content": "response in markdown"}${linkNote}`
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!response.ok) {
      const errText = await response.text()
      return res.status(500).json({ error: 'Anthropic API error', detail: errText })
    }

    const data = await response.json()
    const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Unexpected format', raw: text })
    }

    return res.status(200).json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
