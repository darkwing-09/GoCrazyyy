import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Trophy, Percent, Radio } from 'lucide-react'
import clsx from 'clsx'

export type Tab = 'alltime' | 'deals' | 'today'
export function BoardTabs({ active, category }: { active: Tab; category: string | null }) {
  const base = category ? `/category/${category}` : ''
  const tabs: { id: Tab; to: string; label: string; icon: React.ReactNode }[] = [
    { id: 'alltime', to: base || '/', label: 'All-time', icon: <Trophy className="size-3.5" strokeWidth={1.75} /> },
    { id: 'deals', to: `${base}/deals`, label: 'Deals', icon: <Percent className="size-3.5" strokeWidth={1.75} /> },
    { id: 'today', to: `${base}/today`, label: 'Today', icon: <Radio className="size-3.5 text-accent" strokeWidth={1.75} /> },
  ]
  return (
    <div className="mt-7 flex justify-center">
      <div className="relative inline-flex rounded-full bg-surface p-1 hairline" role="tablist">
        {tabs.map(t => (
          <Link key={t.id} to={t.to} role="tab" aria-selected={active === t.id}
            className={clsx('relative z-10 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300', active === t.id ? 'text-accent-ink' : 'text-ink-2 hover:text-ink')}>
            {active === t.id && <motion.span layoutId="tab-pill" className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[var(--accent-glow)]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            {t.icon}{t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
