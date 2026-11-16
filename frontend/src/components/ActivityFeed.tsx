import { Link } from 'react-router-dom'
import { rupees, timeAgo } from '@/lib/format'
import type { Activity } from '@/lib/api'

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (!items.length) return null
  return (
    <section className="my-5">
      <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-ink-2 uppercase"><span className="size-1.5 rounded-full bg-accent" />Latest activity</h3>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((a, i) => (
          <Link key={a.slug + a.at + i} to={`/product/${a.slug}`} className="flex w-44 shrink-0 items-center gap-2.5 rounded-xl bg-surface px-3 py-2 hairline transition hover:bg-raised">
            <img src={a.favicon ?? ''} alt="" className="size-7 rounded-lg bg-white/5" loading="lazy" />
            <span className="min-w-0"><span className="block truncate text-[12.5px] text-ink">{a.title}</span><span className="tnum block text-[11px] text-ink-3"><span className="text-accent">{rupees(a.amount_paise)}</span> · {timeAgo(a.at)}</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
