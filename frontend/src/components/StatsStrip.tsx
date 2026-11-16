import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppData } from '@/lib/app-data'
import { count, rupees } from '@/lib/format'
import { useTheme } from '@/lib/theme'

export function StatsStrip() {
  const { stats, meta } = useAppData()
  const { reducedMotion } = useTheme()
  const days = meta ? Math.max(1, Math.floor((Date.now() - new Date(meta.launched_at).getTime()) / 86400000)) : null

  const cell = (v: string, label: string, src?: string, index = 0) => (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl bg-surface/80 px-6 py-5 text-center hairline backdrop-blur-xl transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-[0_12px_32px_-8px_var(--accent-glow-subtle)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-accent/5 blur-xl transition-opacity group-hover:opacity-100" />
      <div className="tnum display text-2xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
        {v}
      </div>
      <div className="mt-1 text-[12px] font-medium text-ink-3">
        {label}
        {src && <span className="opacity-75"> · {src}</span>}
      </div>
    </motion.div>
  )

  return (
    <section id="stats" className="mt-16 text-center">
      <p className="text-[14px] text-ink-2">
        {stats?.demo ? 'Demo numbers for this' : 'Live numbers for this'}{' '}
        <Link to="/about" className="text-accent underline underline-offset-4 hover:brightness-125">
          startup leaderboard
        </Link>
        {days !== null && <> since launch {days} day{days === 1 ? '' : 's'} ago</>}
      </p>
      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-3.5 sm:grid-cols-3">
        {cell(
          stats?.visitors_total != null ? count(stats.visitors_total) : '—',
          'visitors',
          stats?.source === 'datafast' ? 'DataFast' : 'connect DataFast',
          0
        )}
        {cell(
          stats ? rupees(stats.revenue_paise) : '—',
          'revenue',
          stats?.revenue_source === 'datafast' ? 'DataFast' : stats?.demo ? 'seeded ledger' : 'ledger',
          1
        )}
        {cell(stats ? count(stats.products) : '—', 'products listed', undefined, 2)}
      </div>
    </section>
  )
}
