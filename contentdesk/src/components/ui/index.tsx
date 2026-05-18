import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; loading?: boolean }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (<button ref={ref} disabled={disabled || loading} className={clsx('inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg disabled:opacity-40 select-none', size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm', variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700', variant === 'secondary' && 'bg-surface-2 text-ink-2 hover:bg-surface-3 border border-ink-5', variant === 'ghost' && 'text-ink-3 hover:text-ink-2 hover:bg-surface-2', variant === 'danger' && 'text-red-600 hover:bg-red-50', className)} {...props}>{loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}{children}</button>))
Button.displayName = 'Button'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (<div className="flex flex-col gap-1.5">{label && <label className="text-xs font-medium text-ink-3">{label}</label>}<input ref={ref} className={clsx('w-full px-3 py-2 text-sm rounded-lg border border-ink-5 bg-white text-ink placeholder-ink-4 outline-none','focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all', error && 'border-red-400', className)} {...props} />{error && <p className="text-xs text-red-500">{error}</p>}</div>))
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (<div className="flex flex-col gap-1.5">{label && <label className="text-xs font-medium text-ink-3">{label}</label>}<textarea ref={ref} className={clsx('w-full px-3 py-2 text-sm rounded-lg border border-ink-5 bg-white text-ink placeholder-ink-4 outline-none resize-none','focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all', error && 'border-red-400', className)} {...props} />{error && <p className="text-xs text-red-500">{error}</p>}</div>))
Textarea.displayName = 'Textarea'

interface BadgeProps { children: ReactNode; color?: 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'; className?: string }
export const Badge = ({ children, color = 'gray', className }: BadgeProps) => { const colors = { gray:'bg-ink-5/40 text-ink-3', blue:'bg-blue-100 text-blue-700', green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700', red:'bg-red-100 text-red-600', violet:'bg-violet-100 text-violet-700' }; return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colors[color], className)}>{children}</span> }

export const Card = ({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (<div onClick={onClick} className={clsx('bg-white rounded-xl border border-ink-5 shadow-sm', onClick && 'cursor-pointer hover:border-brand-400 hover:shadow-md transition-all', className)}>{children}</div>)

export const Spinner = ({ className }: { className?: string }) => (<div className={clsx('w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin', className)} />)

export const Divider = ({ className }: { className?: string }) => (<hr className={clsx('border-ink-5', className)} />)

export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) => (<label className="flex items-center gap-2.5 cursor-pointer select-none"><button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={clsx('relative w-9 h-5 rounded-full transition-colors', on ? 'bg-brand-600' : 'bg-ink-5')}><span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} /></button>{label && <span className="text-sm text-ink-3">{label}</span>}</label>)
