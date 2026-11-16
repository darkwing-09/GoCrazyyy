import { Link } from 'react-router-dom'
import { useAppData } from '@/lib/app-data'
import { count, rupees } from '@/lib/format'

export function StatsStrip() {
  const { stats, meta } = useAppData()
  const days = meta ? Math.max(1, Math.floor((Date.now() - new Date(meta.launched_at).getTime()) / 86400000)) : null
  const cell = (v: string, label: string, src?: string) => (
    <div className="rounded-2xl bg-surface px-6 py-4 text-center hairline">
      <div className="tnum display text-2xl font-semibold">{v}</div>
      <div className="mt-0.5 text-[12px] text-ink-3">{label}{src && <span className="text-ink-3/70"> · {src}</span>}</div>
    </div>
  )
  return (
    <section id="stats" className="mt-14 text-center">
      <p className="text-[14px] text-ink-2">Real numbers for this <Link to="/about" className="text-accent underline-offset-4 hover:underline">small side project</Link>{days !== null && <> since launch {days} day{days === 1 ? '' : 's'} ago</>}</p>
      <div className="mx-auto mt-4 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
        {cell(stats?.visitors_total != null ? count(stats.visitors_total) : '—', 'visitors', stats?.source === 'datafast' ? 'DataFast' : 'connect DataFast')}
        {cell(stats ? rupees(stats.revenue_paise) : '—', 'revenue', stats?.revenue_source === 'datafast' ? 'DataFast' : 'ledger')}
        {cell(stats ? count(stats.products) : '—', 'products listed')}
      </div>
    </section>
  )
}
