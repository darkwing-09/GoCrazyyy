import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Trophy, Percent, Radio } from 'lucide-react'
import clsx from 'clsx'

export type Tab = 'alltime' | 'deals' | 'today'

export function BoardTabs({ active, category }: { active: Tab; category: string | null }) {
  const base = category ? `/category/${category}` : ''
  const tabs: { id: Tab; to: string; label: string; icon: React.ReactNode }[] = [
    { id: 'alltime', to: base || '/', label: 'All-time', icon: <Trophy className="size-3.5" strokeWidth={2} /> },
    { id: 'deals', to: `${base}/deals`, label: 'Deals', icon: <Percent className="size-3.5" strokeWidth={2} /> },
    { id: 'today', to: `${base}/today`, label: 'Today', icon: <Radio className="size-3.5" strokeWidth={2} /> },
  ]

  return (
    <div className="mt-7 flex justify-center">
      <div
        className="relative inline-flex items-center rounded-full bg-surface/95 p-1.5 backdrop-blur-xl hairline shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]"
        role="tablist"
      >
        {tabs.map((t) => {
          const isActive = active === t.id
          return (
            <Link
              key={t.id}
              to={t.to}
              role="tab"
              aria-selected={isActive}
              className={clsx(
                'relative z-10 flex items-center gap-2 rounded-full px-4.5 py-1.5 text-[13.5px] font-medium transition-colors duration-250 outline-none',
                isActive ? 'text-accent-ink font-semibold' : 'text-ink-2 hover:text-ink'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[var(--accent-glow)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className={clsx('transition-transform duration-200', isActive && 'scale-110')}>{t.icon}</span>
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
