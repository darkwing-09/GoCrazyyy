import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useTheme } from '@/lib/theme'

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { reducedMotion } = useTheme()
  return (
    <motion.main
      initial={reducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -6, filter: 'blur(6px)' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto w-full max-w-[1120px] px-4 sm:px-6 ${className}`}
    >
      {children}
    </motion.main>
  )
}

/** Reveal-on-scroll for sections. One grammar: rise + unblur. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { reducedMotion } = useTheme()
  if (reducedMotion) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
