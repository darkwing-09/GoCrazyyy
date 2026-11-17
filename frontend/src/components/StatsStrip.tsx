import { motion } from 'motion/react'
import { useAppData } from '@/lib/app-data'
import { count, rupees } from '@/lib/format'
import { useTheme } from '@/lib/theme'

/** Shown only once DataFast is connected, so every figure on it is independently measured. */
export function StatsStrip() {
  const { stats, meta } = useAppData()
  const { reducedMotion } = useTheme()
  if (!stats || stats.source !== 'datafast' || stats.visitors_total == null) return null

  const days = meta?.launched_at ? Math.max(1, Math.floor((Date.now() - new Date(meta.launched_at).getTime()) / 86400000)) : null
  const cells: [string, string][] = [
    [count(stats.visitors_total), 'visitors'],
    [rupees(stats.revenue_paise), 'paid for placements'],
    [count(stats.products), stats.products === 1 ? 'startup listed' : 'startups listed'],
  ]

  return (
    <section id="stats" className="mt-16 text-center" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="text-[14px] font-medium text-ink-2">
        Live traffic{days !== null && <> since launch {days} day{days === 1 ? '' : 's'} ago</>}
      </h2>
      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-3.5 sm:grid-cols-3">
        {cells.map(([v, label], i) => (
          <motion.div
            key={label}
            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl bg-surface/95 px-6 py-5 hairline backdrop-blur-xl"
          >
            <div className="tnum display text-2xl font-bold tracking-tight text-ink">{v}</div>
            <div className="mt-1 text-[12px] font-medium text-ink-3">{label}</div>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] font-medium text-ink-3">
        Measured independently by DataFast and updated every minute.
        {stats.public_stats_url && <> <a href={stats.public_stats_url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">Open the public dashboard</a>.</>}
      </p>
    </section>
  )
}
