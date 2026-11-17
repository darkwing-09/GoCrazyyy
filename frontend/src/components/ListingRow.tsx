import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import clsx from 'clsx'
import { CatIcon } from './Icon'
import { count, rupees, timeAgo } from '@/lib/format'
import type { Listing } from '@/lib/api'
import { useTheme } from '@/lib/theme'

export function ListingRow({
  l,
  index = 0,
  board = 'alltime',
  onClaim,
  compact,
  offerRatio,
}: {
  l: Listing
  index?: number
  board?: string
  onClaim?: (l: Listing) => void
  compact?: boolean
  /** For rank 1: the amount being offered in the hero divided by this row's total. Drives the glow. */
  offerRatio?: number
}) {
  const { reducedMotion, accent } = useTheme()
  const top = l.rank <= 3
  const isNumberOne = l.rank === 1

  // Dynamic heat factor for rank 1
  const heat = isNumberOne && offerRatio !== undefined ? Math.min(1.8, Math.max(0.4, offerRatio)) : 1
  const spread = Math.round((54 - l.rank * 12) * heat)

  // 3D Tilt state
  const itemRef = useRef<HTMLLIElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, spotlightX: 50, spotlightY: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const onPointerMove = (e: React.PointerEvent<HTMLLIElement>) => {
    if (reducedMotion || !itemRef.current) return
    const rect = itemRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // 3D tilt angles (subtle & premium, max ~3.5 deg)
    const rotateY = ((x - centerX) / centerX) * 3.5
    const rotateX = -((y - centerY) / centerY) * 3.5

    // Spotlight coordinates (percentage)
    const spotlightX = (x / rect.width) * 100
    const spotlightY = (y / rect.height) * 100

    setTilt({ rx: rotateX, ry: rotateY, spotlightX, spotlightY })
  }

  const onPointerLeave = () => {
    setIsHovered(false)
    setTilt({ rx: 0, ry: 0, spotlightX: 50, spotlightY: 50 })
  }

  return (
    <motion.li
      ref={itemRef}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 10) * 0.035, ease: [0.16, 1, 0.3, 1] }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transform:
          !reducedMotion && isHovered
            ? `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateZ(4px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        boxShadow: top
          ? `inset 0 0 0 1px ${isNumberOne ? accent.hex : accent.muted}, 0 10px ${spread}px -12px ${accent.glow}`
          : isHovered
          ? `0 12px 30px -10px rgba(0, 0, 0, 0.45), inset 0 0 0 1px var(--line-strong)`
          : undefined,
      }}
      className={clsx(
        'group relative flex items-start gap-3 rounded-2xl px-3.5 py-3.5 transition-[box-shadow,background-color,transform] duration-250 ease-out sm:gap-4 sm:px-4.5',
        top
          ? 'bg-surface/95 backdrop-blur-xl hairline'
          : 'bg-surface/95 backdrop-blur-md hairline hover:bg-raised'
      )}
    >
      {/* Dynamic Aceternity-style Spotlight specular highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(350px circle at ${tilt.spotlightX}% ${tilt.spotlightY}%, ${accent.subtle.replace('0.08', '0.14')}, transparent 80%)`,
        }}
      />

      {/* Top 1 Glowing Border beam pulse */}
      {isNumberOne && (
        <span
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-[1px] transition-opacity duration-300 group-hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${accent.hex}40, transparent 40%, ${accent.hex}60)`,
          }}
        />
      )}

      {/* Rank indicator with badge */}
      <div className="flex w-8 shrink-0 flex-col items-end pt-1">
        <span
          className={clsx(
            'tnum font-mono text-[13.5px] font-bold transition-colors duration-200',
            top ? 'text-accent' : 'text-ink-2 group-hover:text-ink'
          )}
        >
          #{l.rank}
        </span>
        {isNumberOne && (
          <span
            className="size-1.5 rounded-full mt-1 animate-pulse shadow-[0_0_8px_var(--accent)]"
            style={{ backgroundColor: accent.hex }}
          />
        )}
      </div>

      {/* Favicon with futuristic rounded container */}
      <Link to={`/product/${l.slug}`} className="shrink-0 transition-transform duration-200 group-hover:scale-105" tabIndex={-1} aria-hidden>
        <img
          src={l.favicon ?? ''}
          alt=""
          loading="lazy"
          className="size-11 rounded-xl bg-raised object-cover ring-1 ring-line-strong shadow-sm sm:size-12"
        />
      </Link>

      {/* Listing Content */}
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/product/${l.slug}`}
            className="min-w-0 truncate text-[15.5px] font-semibold text-ink transition-colors hover:text-accent"
          >
            {l.title}
          </Link>
          <span
            className={clsx(
              'tnum shrink-0 font-mono text-[14.5px] font-semibold tracking-tight transition-colors',
              top ? 'text-accent' : 'text-ink'
            )}
          >
            {rupees(l.total_paise)}
          </span>
        </div>

        {!compact && (
          <p className="mt-0.5 line-clamp-1 text-[13.5px] text-ink-2">
            {l.description || l.domain}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-medium text-ink-3">
          {l.deal_text && board === 'deals' && (
            <span className="rounded-md border border-accent/30 bg-accent-muted px-1.5 py-0.5 font-medium text-accent">
              {l.deal_text}
            </span>
          )}
          <Link
            to={`/category/${l.category.slug}`}
            className="inline-flex items-center gap-1 text-ink-2 transition hover:text-ink"
          >
            <CatIcon name={l.category.icon} className="size-3 text-accent" />
            {l.category.name.split(' & ')[0].split(',')[0]}
          </Link>
          <span>·</span>
          <span>{timeAgo(l.published_at)}</span>
          {l.location && (
            <>
              <span>·</span>
              <span className="text-ink-2">{l.location}</span>
            </>
          )}
          {l.twitter && (
            <>
              <span>·</span>
              <a
                href={l.twitter.startsWith('http') ? l.twitter : `https://x.com/${l.twitter.replace('@', '')}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent hover:underline"
              >
                {l.twitter.startsWith('@') ? l.twitter : `@${l.twitter}`}
              </a>
            </>
          )}
          <span>·</span>
          <a
            href={`/out/${l.slug}`}
            target="_blank"
            rel="noreferrer nofollow sponsored"
            className="text-ink-2 transition hover:text-accent"
          >
            {l.domain}
          </a>
          <span>·</span>
          <span className="tnum">{count(l.clicks)} {l.clicks === 1 ? 'click' : 'clicks'}</span>
          <span>·</span>
          <Link to={`/product/${l.slug}`} className="text-ink-2 transition hover:text-ink">
            details
          </Link>

          {onClaim && l.take_price_paise !== null && (
            <button
              onClick={() => onClaim(l)}
              className="ml-auto hidden cursor-pointer rounded-full border border-accent/30 bg-accent-subtle px-2.5 py-1 text-[12px] font-semibold text-accent transition hover:bg-accent hover:text-accent-ink hover:shadow-[var(--accent-glow)] sm:inline-flex"
            >
              feature for {rupees(l.take_price_paise)}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  )
}
