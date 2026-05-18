module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured',
      nodeEnv: process.env.NODE_ENV,
      envCount: Object.keys(process.env).length,
      envKeys: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('TOKEN') && !k.includes('KEY')).slice(0, 20),
    })
  }

  return res.status(200).json({ ok: true, keyLength: apiKey.length })
}
