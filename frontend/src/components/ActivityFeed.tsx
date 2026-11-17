import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { rupees, timeAgo } from '@/lib/format'
import type { Activity } from '@/lib/api'

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (!items.length) return null
  return (
    <section className="my-6 min-w-0">
      <h2 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold tracking-wider text-ink uppercase">
        <span className="size-2 rounded-full bg-accent animate-ping" />
        <span className="size-1.5 rounded-full bg-accent -ml-3.5" />
        Latest placements
      </h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((a, i) => (
          <motion.div key={a.slug + a.at + i} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link
              to={`/product/${a.slug}`}
              className="flex w-46 shrink-0 items-center gap-2.5 rounded-2xl bg-surface/95 backdrop-blur-md px-3 py-2.5 hairline transition hover:border-accent/40 hover:bg-surface hover:shadow-[0_4px_16px_-2px_var(--accent-glow-subtle)]"
            >
              <img
                src={a.favicon ?? ''}
                alt=""
                className="size-7 rounded-lg bg-raised object-cover ring-1 ring-line-strong"
                loading="lazy"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-ink">{a.title}</span>
                <span className="tnum block text-[11.5px] font-medium text-ink-3">
                  <span className="text-accent font-medium">{rupees(a.amount_paise)}</span> · {timeAgo(a.at)}
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
