module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const anthropicKeys = Object.keys(process.env).filter(k => k.toUpperCase().includes('ANTHROP'))
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured',
      keyExists: 'ANTHROPIC_API_KEY' in process.env,
      anthropicRelatedKeys: anthropicKeys,
    })
  }

  return res.status(200).json({ ok: true, keyLength: apiKey.length })
}
