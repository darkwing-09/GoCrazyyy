import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'accent' | 'ghost' | 'outline'; size?: 'sm' | 'md' | 'lg'; sweep?: boolean }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'accent', size = 'md', sweep, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,box-shadow,background-color,color,opacity] duration-300 ease-out-expo',
        'disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-[15px]',
        variant === 'accent' && 'bg-accent text-accent-ink hover:brightness-110 hover:shadow-[var(--accent-glow)]',
        variant === 'ghost' && 'text-ink-2 hover:text-ink hover:bg-white/5',
        variant === 'outline' && 'hairline-strong text-ink hover:bg-white/5',
        sweep && 'sweep',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
