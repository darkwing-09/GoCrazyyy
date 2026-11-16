import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import clsx from 'clsx'
import { CatIcon } from './Icon'
import { count, rupees, timeAgo } from '@/lib/format'
import type { Listing } from '@/lib/api'
import { useTheme } from '@/lib/theme'

export function ListingRow({ l, index = 0, board = 'alltime', onClaim, compact }: {
  l: Listing; index?: number; board?: string; onClaim?: (l: Listing) => void; compact?: boolean
}) {
  const { reducedMotion } = useTheme()
  const top = l.rank <= 3
  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className={clsx('group relative flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors duration-300 sm:gap-4 sm:px-4',
        top ? 'bg-accent-12 hairline' : 'hover:bg-white/[0.03]')}
      style={top ? { boxShadow: `inset 0 0 0 1px var(--accent-20), 0 0 ${48 - l.rank * 12}px -16px var(--accent-40)` } : undefined}
    >
      <span className={clsx('tnum w-8 shrink-0 pt-1 text-right font-mono text-[13px]', top ? 'text-accent' : 'text-ink-3')}>#{l.rank}</span>
      <Link to={`/product/${l.slug}`} className="shrink-0" tabIndex={-1} aria-hidden>
        <img src={l.favicon ?? ''} alt="" loading="lazy" className="size-11 rounded-xl bg-white/5 object-cover ring-1 ring-white/10 sm:size-12" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/product/${l.slug}`} className="min-w-0 truncate text-[15px] font-semibold text-ink hover:underline">{l.title}</Link>
          <span className={clsx('tnum shrink-0 font-mono text-[14px] font-medium', top ? 'text-accent' : 'text-ink')}>{rupees(l.total_paise)}</span>
        </div>
        {!compact && <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-2">{l.description || l.domain}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
          {l.deal_text && board === 'deals' && <span className="rounded-md bg-accent-20 px-1.5 py-0.5 font-medium text-accent">{l.deal_text}</span>}
          <Link to={`/category/${l.category.slug}`} className="inline-flex items-center gap-1 text-ink-2 hover:text-ink"><CatIcon name={l.category.icon} className="size-3" />{l.category.name.split(' & ')[0].split(',')[0]}</Link>
          <span>·</span><span>{timeAgo(l.published_at)}</span>
          <span>·</span><a href={`/out/${l.slug}`} target="_blank" rel="noreferrer nofollow sponsored" className="text-ink-2 hover:text-ink">{l.domain}</a>
          <span>·</span><span className="tnum">{count(l.clicks)} clicks</span>
          <span>·</span><Link to={`/product/${l.slug}`} className="hover:text-ink">see details</Link>
          {onClaim && l.take_price_paise !== null && (
            <button onClick={() => onClaim(l)} className="ml-auto hidden rounded-full px-2.5 py-1 font-medium text-accent transition hover:bg-accent-12 sm:inline-flex">
              claim this rank for {rupees(l.take_price_paise)}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  )
}
