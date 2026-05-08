import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { SectionLabel, Button, Spinner } from '../ui'
import { sendCoachMessage, streamCoachMessage, QUICK_PROMPTS, type CoachMode, type CoachMessage } from '../../lib/ai/coach'

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODES: { id: CoachMode; label: string; icon: string; desc: string }[] = [
  { id: 'boundaries', label: 'Boundaries', icon: '◈', desc: 'Articulate your limits' },
  { id: 'communication', label: 'Communication', icon: '◇', desc: 'Express yourself clearly' },
  { id: 'jealousy', label: 'Jealousy', icon: '◉', desc: 'Navigate difficult emotions' },
  { id: 'bio', label: 'Bio Writer', icon: '⊕', desc: 'Craft your profile' },
  { id: 'general', label: 'Ask Anything', icon: '◎', desc: 'Open conversation' },
]

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  message,
  isStreaming,
}: {
  message: CoachMessage
  isStreaming?: boolean
}) => {
  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex', isAssistant ? 'justify-start' : 'justify-end')}
    >
      {isAssistant && (
        <div className="w-7 h-7 border border-[rgba(185,150,90,0.3)] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
          <span className="text-rose text-xs">V</span>
        </div>
      )}
      <div
        className={clsx(
          'max-w-[85%] px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-bg-2 border border-[rgba(185,150,90,0.14)] text-velour-dim'
            : 'bg-rose text-bg font-normal'
        )}
      >
        {message.content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-rose ml-1 animate-pulse" />
        )}
      </div>
    </motion.div>
  )
}

// ─── Mode selector ────────────────────────────────────────────────────────────

const ModeSelector = ({
  active,
  onChange,
}: {
  active: CoachMode
  onChange: (m: CoachMode) => void
}) => (
  <div className="grid grid-cols-2 gap-2 mb-6">
    {MODES.map((mode) => (
      <button
        key={mode.id}
        onClick={() => onChange(mode.id)}
        className={clsx(
          'flex items-start gap-3 p-3 text-left border transition-all duration-200',
          active === mode.id
            ? 'border-[rgba(201,160,122,0.4)] bg-[rgba(201,160,122,0.06)]'
            : 'border-[rgba(185,150,90,0.14)] hover:border-[rgba(185,150,90,0.3)]'
        )}
      >
        <span className={clsx('text-base mt-0.5', active === mode.id ? 'text-rose' : 'text-velour-muted')}>
          {mode.icon}
        </span>
        <div>
          <p className={clsx('text-[10px] tracking-[0.15em] uppercase', active === mode.id ? 'text-rose' : 'text-velour-dim')}>
            {mode.label}
          </p>
          <p className="text-[10px] text-velour-muted mt-0.5">{mode.desc}</p>
        </div>
      </button>
    ))}
  </div>
)

// ─── Quick prompts ────────────────────────────────────────────────────────────

const QuickPrompts = ({
  mode,
  onSelect,
}: {
  mode: CoachMode
  onSelect: (prompt: string) => void
}) => (
  <div className="flex flex-col gap-2 mb-4">
    <p className="text-[9px] tracking-[0.25em] uppercase text-velour-muted mb-1">Quick start</p>
    {QUICK_PROMPTS[mode].map((prompt) => (
      <button
        key={prompt}
        onClick={() => onSelect(prompt)}
        className="text-left px-4 py-3 border border-[rgba(185,150,90,0.14)] text-velour-dim text-sm hover:border-[rgba(185,150,90,0.35)] hover:text-velour-text transition-all duration-200 leading-relaxed"
      >
        {prompt}
      </button>
    ))}
  </div>
)

// ─── AI Coach Page ────────────────────────────────────────────────────────────

export const AICoachPage = () => {
  const [mode, setMode] = useState<CoachMode>('general')
  const [history, setHistory] = useState<CoachMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [showModes, setShowModes] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamingText])

  const changeMode = (newMode: CoachMode) => {
    setMode(newMode)
    setHistory([])
    setStreamingText('')
    setShowModes(false)
  }

  const send = async (text?: string) => {
    const message = text || input.trim()
    if (!message || isLoading) return

    setInput('')
    setShowModes(false)
    setIsLoading(true)

    const userMsg: CoachMessage = { role: 'user', content: message }
    setHistory(prev => [...prev, userMsg])

    let streamed = ''
    setStreamingText('')

    await streamCoachMessage(
      mode,
      history,
      message,
      (chunk) => {
        streamed += chunk
        setStreamingText(streamed)
      },
      () => {
        setHistory(prev => [...prev, { role: 'assistant', content: streamed }])
        setStreamingText('')
        setIsLoading(false)
      }
    )
  }

  const activeMode = MODES.find(m => m.id === mode)!

  return (
    <div className="flex flex-col h-[calc(100svh-5rem)] lg:h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[rgba(185,150,90,0.14)] bg-bg/95 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>AI Coach</SectionLabel>
            <div className="flex items-center gap-2 -mt-3">
              <span className="text-rose text-sm">{activeMode.icon}</span>
              <h1 className="font-serif text-lg font-light text-velour-text">{activeMode.label}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={() => { setHistory([]); setShowModes(true) }}
                className="text-[9px] tracking-[0.2em] uppercase text-velour-muted hover:text-rose transition-colors px-3 py-2 border border-[rgba(185,150,90,0.14)]"
              >
                New
              </button>
            )}
            <button
              onClick={() => setShowModes(!showModes)}
              className="text-[9px] tracking-[0.2em] uppercase text-velour-muted hover:text-rose transition-colors px-3 py-2 border border-[rgba(185,150,90,0.14)]"
            >
              {showModes ? 'Hide' : 'Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {/* Mode selector */}
          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ModeSelector active={mode} onChange={changeMode} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state with quick prompts */}
          {history.length === 0 && !showModes && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center py-8 mb-6">
                <div className="text-4xl text-rose opacity-20 mb-4">{activeMode.icon}</div>
                <p className="font-serif italic text-velour-dim text-base">{activeMode.desc}</p>
                <p className="text-velour-muted text-xs mt-2">Private · Encrypted · Non-judgmental</p>
              </div>
              <QuickPrompts mode={mode} onSelect={send} />
            </motion.div>
          )}

          {/* Chat history */}
          <div className="flex flex-col gap-4">
            {history.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {/* Streaming */}
            {streamingText && (
              <MessageBubble
                message={{ role: 'assistant', content: streamingText }}
                isStreaming={true}
              />
            )}

            {/* Loading indicator */}
            {isLoading && !streamingText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 border border-[rgba(185,150,90,0.3)] flex items-center justify-center">
                  <span className="text-rose text-xs">V</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-rose opacity-40 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[rgba(185,150,90,0.14)] bg-bg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={`Ask about ${activeMode.label.toLowerCase()}...`}
            disabled={isLoading}
            className="flex-1 bg-bg-2 border border-[rgba(185,150,90,0.18)] focus:border-[rgba(185,150,90,0.45)] px-4 py-3 text-sm text-velour-text placeholder-velour-muted outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isLoading}
            className="bg-rose text-bg px-4 py-3 hover:bg-rose-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[9px] text-velour-muted mt-2 text-center tracking-wide">
          Powered by AI · Private · Never stored
        </p>
      </div>
    </div>
  )
}
