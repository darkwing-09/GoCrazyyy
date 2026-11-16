import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { rupees } from '@/lib/format'
import type { Listing } from '@/lib/api'

function Mini({ title, items, to, empty }: { title: string; items: Listing[]; to: string; empty: string }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold"><span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />{title}</h3>
        <Link to={to} className="inline-flex items-center text-[12px] text-ink-3 hover:text-accent">See all <ChevronRight className="size-3.5" /></Link>
      </div>
      {items.length === 0 ? <p className="text-[12.5px] text-ink-3">{empty}</p> : (
        <ol className="space-y-1">
          {items.map(l => (
            <li key={l.slug}>
              <Link to={`/product/${l.slug}`} className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-white/5">
                <span className="tnum w-5 font-mono text-[11px] text-ink-3">#{l.rank}</span>
                <img src={l.favicon ?? ''} alt="" className="size-5 rounded-md bg-white/5" loading="lazy" />
                <span className="min-w-0 flex-1 truncate text-[12.5px]">{l.title}</span>
                <span className="tnum font-mono text-[12px] text-accent">{rupees(l.total_paise)}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function SideBoards({ deals, today, category }: { deals: Listing[]; today: Listing[]; category: string | null }) {
  const base = category ? `/category/${category}` : ''
  return (
    <aside className="space-y-7 lg:sticky lg:top-20">
      <Mini title="Deals" items={deals} to={`${base}/deals`} empty="Nobody has listed a deal yet." />
      <Mini title="Today's ranking" items={today} to={`${base}/today`} empty="Nobody has claimed a rank since midnight IST." />
    </aside>
  )
}
