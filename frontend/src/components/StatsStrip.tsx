import { motion } from 'motion/react'
import { Globe2, Share2 } from 'lucide-react'
import { useAppData } from '@/lib/app-data'
import { count, rupees } from '@/lib/format'
import { useTheme } from '@/lib/theme'
import type { Stat } from '@/lib/api'

/** Traffic measured independently by DataFast; money and listings from our own ledger.
 *  Hidden until DataFast has recorded real visitors, so nothing here is ever a placeholder. */
export function StatsStrip() {
  const { stats, meta } = useAppData()
  const { reducedMotion } = useTheme()
  if (!stats || stats.source !== 'datafast' || !stats.visitors_total) return null

  const days = meta?.launched_at ? Math.max(1, Math.floor((Date.now() - new Date(meta.launched_at).getTime()) / 86400000)) : null
  const today = stats.visitors_today ?? 0
  const cells: [string, string, string | null][] = [
    [count(stats.visitors_total), 'visitors', today > 0 ? `${count(today)} today` : null],
    [count(stats.pageviews_total ?? 0), 'pageviews', null],
    [count(stats.products), stats.products === 1 ? 'startup listed' : 'startups listed', null],
    [rupees(stats.revenue_paise), 'spent on placements', null],
  ]
  const avgMin = stats.avg_session_seconds ? Math.max(1, Math.round(stats.avg_session_seconds / 60)) : null

  return (
    <section id="stats" className="mt-16 text-center" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="text-[14px] font-semibold text-ink-2">
        Live traffic{days !== null && <> since launch {days} day{days === 1 ? '' : 's'} ago</>}
      </h2>
      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {cells.map(([v, label, sub], i) => (
          <motion.div
            key={label}
            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl bg-surface/95 px-4 py-5 hairline backdrop-blur-xl"
          >
            <div className="tnum display text-2xl font-bold tracking-tight text-ink">{v}</div>
            <div className="mt-1 text-[12px] font-medium text-ink-3">{label}</div>
            {sub && <div className="tnum mt-0.5 text-[11.5px] font-semibold text-accent">{sub}</div>}
          </motion.div>
        ))}
      </div>

      {(stats.top_countries.length > 0 || stats.top_sources.length > 0) && (
        <div className="mx-auto mt-3 grid max-w-3xl gap-3 sm:grid-cols-2">
          <TopList title="Top countries" icon={<Globe2 className="size-3.5 text-accent" strokeWidth={1.75} />} rows={stats.top_countries} />
          <TopList title="Top traffic sources" icon={<Share2 className="size-3.5 text-accent" strokeWidth={1.75} />} rows={stats.top_sources} />
        </div>
      )}

      <p className="mt-4 text-[12.5px] font-medium text-ink-3">
        Measured independently by DataFast and refreshed every minute.
        {avgMin && <> Average visit: {avgMin} min.</>}
        {stats.public_stats_url && <> <a href={stats.public_stats_url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">Open the public dashboard</a>.</>}
      </p>
    </section>
  )
}

function TopList({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: Stat[] }) {
  if (rows.length === 0) return null
  const max = Math.max(...rows.map(r => r.visitors), 1)
  return (
    <div className="rounded-3xl bg-surface/95 p-4 text-left hairline">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">{icon}{title}</h3>
      <ol className="space-y-1.5">
        {rows.map(r => (
          <li key={r.name} className="relative overflow-hidden rounded-lg px-2.5 py-1.5 text-[12.5px]">
            <span className="absolute inset-y-0 left-0 rounded-lg bg-accent-subtle" style={{ width: `${(r.visitors / max) * 100}%` }} aria-hidden />
            <span className="relative flex items-center justify-between gap-3">
              <span className="truncate font-medium text-ink-2">{r.name}</span>
              <span className="tnum font-semibold text-ink">{count(r.visitors)}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
