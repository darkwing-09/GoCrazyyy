import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell, Reveal } from '@/components/PageShell'
import { Countdown } from '@/components/Countdown'
import { api, type Day } from '@/lib/api'
import { count, rupees } from '@/lib/format'

export function Daily() {
  const [days, setDays] = useState<Day[] | null>(null)
  const [resets, setResets] = useState<string | null>(null)
  useEffect(() => { api.daily().then(r => { setDays(r.days); setResets(r.resets_at ?? null) }) }, [])
  const fmt = (d: string) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d + 'T00:00:00'))
  return (
    <PageShell>
      <h1 className="display mt-10 text-center text-[2.25rem] font-bold sm:text-[2.75rem]">One board per day</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-[14.5px] text-ink-2">Each IST day gets its own frozen leaderboard of that day's spend. Whales can own All-time; today is anyone's.</p>
      <div className="mt-10 space-y-3">
        {days !== null && days.length === 0 && (
          <div className="rounded-2xl bg-surface px-6 py-14 text-center hairline">
            <p className="display text-xl font-semibold">Today's board is open.</p>
            <p className="mt-2 text-[13.5px] text-ink-2">The first claim of the day takes #1. <Link to="/today" className="text-accent underline-offset-4 hover:underline">Claim today's top spot</Link>.</p>
          </div>
        )}
        {(days ?? []).map((d, i) => (
          <Reveal key={d.day} delay={Math.min(i, 6) * 0.04}>
            <section className="rounded-2xl bg-surface p-4 hairline sm:p-5" style={d.live ? { boxShadow: 'inset 0 0 0 1px var(--accent-20), var(--accent-glow)' } : undefined}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="font-semibold">{fmt(d.day)}</h2>
                {d.live && resets && <span className="flex items-center gap-2 text-[12px] text-accent"><span className="size-1.5 animate-pulse rounded-full bg-accent" />live · resets in <Countdown to={resets} /></span>}
                <span className="ml-auto text-[12.5px] font-medium text-ink-3"><span className="tnum text-ink">{count(d.count)}</span> {d.count === 1 ? 'listing' : 'listings'} · <span className="tnum font-mono text-ink">{rupees(d.revenue_paise)}</span></span>
              </div>
              {d.top.length === 0 ? <p className="mt-3 text-[13px] font-medium text-ink-3">No ranks claimed{d.live ? ' yet today' : ' that day'}.</p> : (
                <ol className="mt-3 grid gap-2 sm:grid-cols-3">
                  {d.top.map(l => (
                    <li key={l.slug}><Link to={`/product/${l.slug}`} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-accent-subtle"><span className="tnum font-mono text-[12px] text-accent">#{l.rank}</span><img src={l.favicon ?? ''} alt="" className="size-7 rounded-lg bg-line-strong" loading="lazy" /><span className="min-w-0 flex-1 truncate text-[13px]">{l.title}</span><span className="tnum font-mono text-[12px] text-ink-2">{rupees(l.total_paise)}</span></Link></li>
                  ))}
                </ol>
              )}
              {d.count > 3 && <Link to={d.live ? '/today' : `/daily/${d.day}`} className="mt-3 inline-block text-[12.5px] text-accent hover:underline">Show all {d.count} ranks →</Link>}
            </section>
          </Reveal>
        ))}
      </div>
    </PageShell>
  )
}

export function DailyDay() {
  const { day = '' } = useParams()
  const [items, setItems] = useState<Day['top']>([])
  useEffect(() => { api.board('daily', { day }).then(b => setItems(b.items)) }, [day])
  return (
    <PageShell>
      <h1 className="display mt-10 text-center text-[2rem] font-bold">Board for {day}</h1>
      <ol className="mt-8 space-y-1">{items.map(l => <li key={l.slug} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent-subtle"><span className="tnum w-8 font-mono text-[13px] text-ink-3">#{l.rank}</span><img src={l.favicon ?? ''} alt="" className="size-8 rounded-lg bg-line-strong" /><Link to={`/product/${l.slug}`} className="flex-1 truncate text-[14px] hover:underline">{l.title}</Link><span className="tnum font-mono text-accent">{rupees(l.total_paise)}</span></li>)}</ol>
      <Link to="/daily" className="mt-6 inline-block text-[13px] font-medium text-ink-2 hover:text-ink">← All days</Link>
    </PageShell>
  )
}
