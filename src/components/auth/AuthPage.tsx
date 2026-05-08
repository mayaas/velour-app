import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Input } from '../ui'
import { signIn, signUp } from '../../lib/supabase'
import { useAuthStore } from '../../store'

type AuthMode = 'signin' | 'signup'

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { data, error } = await signIn(email, password)
        if (error) throw error
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email!, created_at: data.user.created_at })
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-4xl mb-6 text-rose opacity-60">◎</div>
          <h2 className="font-serif text-2xl font-light mb-4 text-velour-text">Check your email</h2>
          <p className="text-velour-dim text-sm leading-relaxed">
            We've sent a confirmation link to <strong className="text-velour-text">{email}</strong>.
            <br />Click it to activate your account.
          </p>
          <p className="text-velour-muted text-[11px] mt-6">
            Discreet. We will never share your email.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left — decoration (desktop) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-2 to-bg" />
        {/* Orbits */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {[120, 200, 280].map((size, i) => (
            <div
              key={i}
              className="absolute border border-[rgba(185,150,90,0.15)] rounded-full"
              style={{
                width: size,
                height: size,
                animation: `spin ${20 + i * 15}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
              }}
            >
              {i === 0 && (
                <div className="absolute w-1.5 h-1.5 bg-rose rounded-full -top-0.5 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(201,160,122,0.8)]" />
              )}
            </div>
          ))}
          <div className="text-center z-10">
            <div className="font-serif text-5xl font-light text-velour-text tracking-wide mb-2">
              Velour<span className="text-rose">.</span>
            </div>
            <p className="text-velour-dim text-xs tracking-[0.3em] uppercase">
              Human Dynamics Platform
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-center">
          <p className="font-serif italic text-velour-dim text-lg">
            "Not another dating app."
          </p>
          <p className="text-velour-muted text-[11px] tracking-[0.2em] uppercase mt-2">
            Privacy · Trust · Depth
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-12 text-center">
          <div className="font-serif text-3xl font-light text-velour-text tracking-wide">
            Velour<span className="text-rose">.</span>
          </div>
          <p className="text-velour-muted text-[9px] tracking-[0.3em] uppercase mt-1">
            Human Dynamics Platform
          </p>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mode label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-5 h-px bg-rose opacity-50" />
            <span className="text-rose text-[9px] tracking-[0.38em] uppercase">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-light text-velour-text mb-2">
            {mode === 'signin' ? 'Sign in' : 'Join Velour'}
          </h1>
          <p className="text-velour-dim text-sm mb-8 leading-relaxed">
            {mode === 'signin'
              ? 'Your private space awaits.'
              : 'Discreet, secure, and entirely yours.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400/80 text-[11px] leading-relaxed"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(185,150,90,0.14)]" />
            <span className="text-velour-muted text-[10px]">or</span>
            <div className="flex-1 h-px bg-[rgba(185,150,90,0.14)]" />
          </div>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="w-full mt-6 text-center text-velour-dim text-[11px] tracking-[0.1em] hover:text-rose-light transition-colors"
          >
            {mode === 'signin'
              ? "Don't have an account? Join Velour"
              : 'Already a member? Sign in'}
          </button>

          <p className="text-center text-velour-muted text-[10px] mt-8 leading-relaxed">
            By continuing you agree to our{' '}
            <a href="#" className="text-rose-dim hover:text-rose transition-colors">Terms</a>
            {' & '}
            <a href="#" className="text-rose-dim hover:text-rose transition-colors">Privacy Policy</a>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
