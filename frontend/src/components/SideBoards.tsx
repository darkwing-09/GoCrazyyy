import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { rupees } from '@/lib/format'
import type { Listing } from '@/lib/api'

function Mini({
  title,
  items,
  to,
  empty,
}: {
  title: string
  items: Listing[]
  to: string
  empty: string
}) {
  return (
    <section className="rounded-3xl bg-surface/95 backdrop-blur-xl p-4 hairline shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-tight text-ink">
          <span className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
          {title}
        </h2>
        <Link
          to={to}
          className="group inline-flex items-center text-[12px] font-medium text-ink-2 hover:text-accent transition-colors"
        >
          See all
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[12.5px] font-medium text-ink-3 py-3 text-center">{empty}</p>
      ) : (
        <ol className="space-y-1.5">
          {items.slice(0, 5).map((l) => (
            <li key={l.slug}>
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                <Link
                  to={`/product/${l.slug}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent-subtle"
                >
                  <span className="tnum w-5 font-mono text-[11.5px] font-semibold text-accent">
                    #{l.rank}
                  </span>
                  <img
                    src={l.favicon ?? ''}
                    alt=""
                    className="size-5.5 rounded-lg bg-raised object-cover ring-1 ring-line"
                    loading="lazy"
                  />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">
                    {l.title}
                  </span>
                  <span className="tnum font-mono text-[12px] font-semibold text-accent">
                    {rupees(l.total_paise)}
                  </span>
                </Link>
              </motion.div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function SideBoards({
  deals,
  today,
  category,
}: {
  deals: Listing[]
  today: Listing[]
  category: string | null
}) {
  const base = category ? `/category/${category}` : ''
  return (
    <aside className="space-y-6 lg:sticky lg:top-20">
      <Mini title="Top Deals" items={deals} to={`${base}/deals`} empty="Nobody has listed a deal yet." />
      <Mini
        title="Today's Board"
        items={today}
        to={`${base}/today`}
        empty="Nobody has claimed a rank since midnight IST."
      />
    </aside>
  )
}
