// @ts-check
'use strict'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, content, apiToken } = req.body || {}

  if (!title || !content || !apiToken) {
    return res.status(400).json({ error: 'Missing required fields: title, content, apiToken' })
  }

  try {
    const meResponse = await fetch('https://api.medium.com/v1/me', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    const meData = await meResponse.json()

    if (!meResponse.ok) {
      return res.status(meResponse.status).json({ error: meData.errors?.[0]?.message || 'Failed to fetch Medium user', details: meData })
    }

    const userId = meData.data && meData.data.id

    if (!userId) {
      return res.status(500).json({ error: 'Could not retrieve Medium user ID' })
    }

    const postResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        contentFormat: 'markdown',
        content,
        publishStatus: 'public',
      }),
    })

    const postData = await postResponse.json()

    if (!postResponse.ok) {
      return res.status(postResponse.status).json({ error: postData.errors?.[0]?.message || 'Medium API error', details: postData })
    }

    return res.status(200).json({ url: postData.data.url })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
