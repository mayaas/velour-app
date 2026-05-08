import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'rose' | 'ghost' | 'danger' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'rose', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 transition-all duration-300 tracking-[0.22em] uppercase font-sans text-[10px] select-none disabled:opacity-40 active:scale-[0.98]'

    const variants = {
      rose: 'bg-rose text-bg hover:bg-rose-light border-0',
      ghost: 'bg-transparent text-velour-dim hover:text-rose-light',
      danger: 'bg-transparent text-red-400 hover:text-red-300',
      icon: 'bg-transparent text-velour-dim hover:text-rose p-2',
    }

    const sizes = {
      sm: 'px-5 py-2.5 text-[9px]',
      md: 'px-7 py-3.5',
      lg: 'px-10 py-4',
    }

    const ghostBorder = variant === 'ghost'
      ? 'border border-[rgba(185,150,90,0.2)] hover:border-[rgba(185,150,90,0.45)]'
      : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], variant !== 'icon' && sizes[size], ghostBorder, className)}
        {...props}
      >
        {loading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-velour-muted text-sm">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-bg-2 px-4 py-3 text-velour-text placeholder-velour-muted text-sm font-sans font-light outline-none transition-all duration-200',
            'border border-[rgba(185,150,90,0.18)] focus:border-[rgba(185,150,90,0.5)] focus:bg-bg-3',
            icon && 'pl-10',
            error && 'border-red-400/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[9px] tracking-[0.3em] uppercase text-velour-dim">{label}</label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'w-full bg-bg-2 px-4 py-3 text-velour-text placeholder-velour-muted text-sm font-sans font-light outline-none transition-all duration-200 resize-none',
          'border border-[rgba(185,150,90,0.18)] focus:border-[rgba(185,150,90,0.5)] focus:bg-bg-3',
          error && 'border-red-400/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const Card = ({ children, className, hover = true, onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-bg-2 transition-all duration-300',
      'border border-[rgba(185,150,90,0.14)]',
      hover && 'hover:bg-bg-3 hover:border-[rgba(185,150,90,0.32)]',
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode
  variant?: 'rose' | 'ghost' | 'verified' | 'premium'
  className?: string
}

export const Badge = ({ children, variant = 'ghost', className }: BadgeProps) => {
  const variants = {
    ghost: 'text-velour-muted border-[rgba(185,150,90,0.2)]',
    rose: 'text-rose border-[rgba(201,160,122,0.35)] bg-[rgba(201,160,122,0.06)]',
    verified: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    premium: 'text-gold border-gold/30 bg-gold/5',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center text-[8px] tracking-[0.2em] uppercase py-1 px-2.5 border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export const Divider = ({ className }: { className?: string }) => (
  <hr className={clsx('border-0 border-t border-[rgba(185,150,90,0.14)] my-6', className)} />
)

// ─── Section Label ────────────────────────────────────────────────────────────

export const SectionLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={clsx('flex items-center gap-3 mb-5', className)}>
    <span className="block w-5 h-px bg-rose opacity-50" />
    <span className="text-rose text-[9px] tracking-[0.38em] uppercase">{children}</span>
  </div>
)

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div
      className={clsx(
        sizes[size],
        'border border-rose border-t-transparent rounded-full animate-spin'
      )}
    />
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div
      className={clsx(
        sizes[size],
        'flex items-center justify-center overflow-hidden border border-[rgba(185,150,90,0.2)] flex-shrink-0',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-serif text-rose-light font-light">{initials}</span>
      )}
    </div>
  )
}

// ─── CompatibilityBar ────────────────────────────────────────────────────────

export const CompatibilityBar = ({
  score,
  label,
  showLabel = true,
}: {
  score: number
  label?: string
  showLabel?: boolean
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    {showLabel && label && (
      <div className="flex justify-between items-center">
        <span className="text-[10px] tracking-[0.1em] uppercase text-velour-muted">{label}</span>
        <span className="text-[11px] text-velour-dim">{Math.round(score * 100)}%</span>
      </div>
    )}
    <div className="h-px w-full bg-[rgba(185,150,90,0.1)]">
      <div
        className="h-full bg-gradient-to-r from-rose-dim to-rose transition-all duration-700"
        style={{ width: `${score * 100}%` }}
      />
    </div>
  </div>
)
