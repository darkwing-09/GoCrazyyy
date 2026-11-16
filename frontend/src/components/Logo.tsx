import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="GoCrazy home">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex size-7 items-center justify-center rounded-xl bg-raised border border-line shadow-sm transition-shadow duration-300 group-hover:shadow-[0_0_16px_var(--accent-glow-subtle)]"
      >
        <svg viewBox="0 0 64 64" className="size-5" aria-hidden>
          <rect width="64" height="64" rx="14" fill="var(--raised)" />
          <path d="M14 44h8V26h-8zM28 44h8V16h-8zM42 44h8V32h-8z" fill="var(--accent)" />
        </svg>
      </motion.div>
      <span className="display text-[1.15rem] font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
        GoCrazy
      </span>
    </Link>
  )
}
