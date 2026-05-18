// @ts-check
'use strict'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, content, apiKey } = req.body || {}

  if (!title || !content || !apiKey) {
    return res.status(400).json({ error: 'Missing required fields: title, content, apiKey' })
  }

  try {
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        article: {
          title,
          body_markdown: content,
          published: true,
          tags: ['recruitment', 'ai', 'hiring'],
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'DEV.to API error', details: data })
    }

    return res.status(200).json({ url: data.url })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
