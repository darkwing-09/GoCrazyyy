import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { PageShell, Reveal } from '@/components/PageShell'
import { CatIcon } from '@/components/Icon'
import { api, type CategoryCard } from '@/lib/api'
import { rupees, timeAgo } from '@/lib/format'

export function Categories() {
  const [cats, setCats] = useState<CategoryCard[]>([])
  const [hot, setHot] = useState<string[]>([])
  useEffect(() => { api.categories().then(r => { setCats(r.categories); setHot(r.hottest) }) }, [])
  const hotCards = hot.map(s => cats.find(c => c.slug === s)!).filter(Boolean)
  return (
    <PageShell>
      <h1 className="display mt-10 text-center text-[2.25rem] font-bold sm:text-[2.75rem]">Every category has its own #1</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-[14.5px] text-ink-2">Each category is priced separately. Feature at the top of a quiet category for a few hundred rupees, or in the busiest ones.</p>

      {hotCards.length > 0 && (
        <Reveal className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Flame className="size-4 text-accent" />Most active right now</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {hotCards.map((c, i) => (
              <Link key={c.slug} to={`/category/${c.slug}`} className="group rounded-2xl bg-surface p-4 hairline transition hover:bg-raised" style={i === 0 ? { boxShadow: 'inset 0 0 0 1px var(--accent-20), var(--accent-glow)' } : undefined}>
                <div className="flex items-center gap-2 font-semibold"><span className="tnum font-mono text-[13px] text-accent">#{i + 1}</span><CatIcon name={c.icon} className="size-4 text-accent" />{c.name}</div>
                <div className="mt-2 flex justify-between text-[12px] font-medium text-ink-3"><span><span className="tnum text-ink">{c.claims}</span> {c.claims === 1 ? 'listing' : 'listings'}</span><span>{timeAgo(c.last_claim_at)}</span></div>
                {c.top[0] && <div className="mt-3 flex items-center gap-2 text-[12.5px]"><img src={c.top[0].favicon ?? ''} alt="" className="size-5 rounded-md bg-line-strong" /><span className="truncate text-ink-2">Leading <span className="text-ink">{c.top[0].title}</span></span><span className="tnum ml-auto font-mono text-accent">{rupees(c.top[0].total_paise)}</span></div>}
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 0.05}>
            <div className="h-full rounded-2xl bg-surface p-4 hairline transition hover:bg-raised">
              <Link to={`/category/${c.slug}`} className="flex items-center gap-2 font-semibold hover:text-accent"><CatIcon name={c.icon} className="size-4 text-accent" />{c.name}</Link>
              {c.top.length === 0 ? (
                <p className="mt-3 text-[12.5px] font-medium text-ink-3">Top spot open. <Link to={`/category/${c.slug}`} className="text-accent hover:underline">Feature here for {rupees(c.take_top_paise)}</Link>.</p>
              ) : (
                <ol className="mt-3 space-y-1">
                  {c.top.map(l => (
                    <li key={l.slug}><Link to={`/product/${l.slug}`} className="flex items-center gap-2 rounded-lg px-1 py-1 text-[12.5px] hover:bg-accent-subtle"><span className="tnum w-5 font-mono text-[11px] font-medium text-ink-3">#{l.rank}</span><img src={l.favicon ?? ''} alt="" className="size-5 rounded-md bg-line-strong" loading="lazy" /><span className="min-w-0 flex-1 truncate">{l.title}</span><span className="tnum font-mono text-accent">{rupees(l.total_paise)}</span></Link></li>
                  ))}
                </ol>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  )
}
