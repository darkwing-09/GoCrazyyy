import { forwardRef, useRef, type ButtonHTMLAttributes } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import clsx from 'clsx'
import { useTheme } from '@/lib/theme'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'accent' | 'ghost' | 'outline' | 'neon-glow'
  size?: 'sm' | 'md' | 'lg'
  sweep?: boolean
  magnetic?: boolean
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'accent', size = 'md', sweep, magnetic = true, children, onPointerMove, onPointerLeave, ...rest },
  ref
) {
  const innerRef = useRef<HTMLButtonElement | null>(null)
  const { reducedMotion } = useTheme()

  // Magnetic spring physics
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springConfig = { damping: 16, stiffness: 220, mass: 0.1 }
  const x = useSpring(rawX, springConfig)
  const y = useSpring(rawY, springConfig)

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(e)
    if (reducedMotion || !magnetic || !innerRef.current) return
    const rect = innerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    // Subtle magnetic pull (max ~6px)
    rawX.set(distanceX * 0.2)
    rawY.set(distanceY * 0.2)
  }

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(e)
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.button
      ref={(el) => {
        innerRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
      }}
      style={reducedMotion || !magnetic ? undefined : { x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,box-shadow,border-color,color] duration-250 ease-out',
        'cursor-pointer disabled:cursor-not-allowed disabled:shadow-none select-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-10 px-4.5 text-[14px]',
        size === 'lg' && 'h-12 px-6 text-[15px]',
        variant === 'accent' &&
          'bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active shadow-[var(--accent-glow)] hover:shadow-[0_10px_40px_-2px_var(--accent-glow)] font-semibold',
        // Not ready yet: an unlit sky outline with solid, readable text instead of a faded fill.
        variant === 'accent' &&
          'disabled:bg-accent-muted disabled:text-accent-hover disabled:ring-1 disabled:ring-inset disabled:ring-accent/45',
        variant === 'neon-glow' &&
          'border border-accent/40 bg-accent-subtle text-accent hover:bg-accent-muted hover:border-accent hover:shadow-[var(--accent-glow)] disabled:border-line-strong disabled:bg-transparent disabled:text-ink-3',
        variant === 'ghost' &&
          'text-ink-2 hover:text-ink hover:bg-accent-subtle disabled:bg-transparent disabled:text-ink-3',
        variant === 'outline' &&
          'hairline-strong text-ink hover:text-accent hover:border-accent/40 hover:bg-accent-subtle disabled:bg-transparent disabled:text-ink-3',
        sweep && 'sweep',
        className
      )}
      {...(rest as any)}
    >
      {/* Subtle glowing reflection layer */}
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-enabled:group-hover:opacity-100 bg-gradient-to-t from-white/0 via-white/10 to-white/20" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
})
