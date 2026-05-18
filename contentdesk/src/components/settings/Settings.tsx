import { useState } from 'react'
import { useStore } from '../../store'

export const Settings = () => {
  const { platformKeys, setPlatformKey } = useStore()

  const [devtoKey, setDevtoKey]       = useState(platformKeys.devto ?? '')
  const [mediumToken, setMediumToken] = useState(platformKeys.medium ?? '')
  const [saved, setSaved]             = useState(false)

  const handleSave = () => {
    if (devtoKey.trim())    setPlatformKey('devto', devtoKey.trim())
    if (mediumToken.trim()) setPlatformKey('medium', mediumToken.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink block">DEV.to API Key</label>
        <input
          type="password"
          value={devtoKey}
          onChange={(e) => setDevtoKey(e.target.value)}
          placeholder="Enter your DEV.to API key…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-ink-5 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
        <p className="text-xs text-ink-4">Get at dev.to/settings/extensions → Generate API Key</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink block">Medium Integration Token</label>
        <input
          type="password"
          value={mediumToken}
          onChange={(e) => setMediumToken(e.target.value)}
          placeholder="Enter your Medium integration token…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-ink-5 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
        <p className="text-xs text-ink-4">Get at medium.com/me/settings/security → Integration tokens</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          Save
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
      </div>

      <p className="text-xs text-ink-4 border-t border-ink-5 pt-4">
        Keys are stored locally in your browser only.
      </p>
    </div>
  )
}
