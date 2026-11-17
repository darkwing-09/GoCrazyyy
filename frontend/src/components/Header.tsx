import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, Menu } from 'lucide-react'
import clsx from 'clsx'
import { Logo } from './Logo'
import { useAppData } from '@/lib/app-data'
import { api, type Listing } from '@/lib/api'
import { count, rupees } from '@/lib/format'

const nav = [
  { to: '/today', label: 'Today' },
  { to: '/daily', label: 'Daily' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
]

export function Header() {
  const { stats } = useAppData()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-4 sm:px-6">
        <Logo />
        <LiveStrip online={stats?.online ?? null} today={stats?.visitors_today ?? null} url={stats?.public_stats_url ?? null} />
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => clsx('rounded-full px-3 py-1.5 text-[13.5px] font-medium transition', isActive ? 'beam text-ink' : 'text-ink-2 hover:text-ink')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <button onClick={() => setSearchOpen(true)} aria-label="Search listings" className="flex size-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-accent-subtle hover:text-ink">
            <Search className="size-[18px]" strokeWidth={1.75} />
          </button>
          <button onClick={() => setMenu(m => !m)} aria-label="Menu" aria-expanded={menu} className="flex size-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-accent-subtle hover:text-ink md:hidden">
            {menu ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-t border-line md:hidden" aria-label="Primary mobile">
            <div className="flex flex-col px-4 py-2">
              {nav.map(n => <NavLink key={n.to} to={n.to} onClick={() => setMenu(false)} className={({ isActive }) => clsx('rounded-lg px-3 py-2.5 text-[15px] font-medium', isActive ? 'text-accent' : 'text-ink-2')}>{n.label}</NavLink>)}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

/** Live visitors from DataFast. Visible on every screen size; hidden until there is a real number. */
function LiveStrip({ online, today, url }: { online: number | null; today: number | null; url: string | null }) {
  const on = online ?? 0
  const td = today ?? 0
  if (on <= 0 && td <= 0) return null
  const Inner = (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent-subtle px-2.5 py-1 text-[12px] font-semibold text-ink-2 ring-1 ring-accent/25">
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      {on > 0 && <span className="tnum text-ink"><span className="text-accent">{count(on)}</span> online</span>}
      {on > 0 && td > 0 && <span className="hidden text-ink-3 sm:inline" aria-hidden>·</span>}
      {td > 0 && <span className={clsx('tnum', on > 0 && 'hidden sm:inline')}>{count(td)} {td === 1 ? 'visitor' : 'visitors'} today</span>}
    </span>
  )
  return url
    ? <a href={url} target="_blank" rel="noreferrer" className="ml-1 sm:ml-2" aria-label="Live visitor stats">{Inner}</a>
    : <span className="ml-1 sm:ml-2" aria-live="polite">{Inner}</span>
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [all, setAll] = useState<Listing[] | null>(null)
  const nav = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    setQ(''); setTimeout(() => input.current?.focus(), 30)
    if (!all) api.board('alltime').then(b => setAll(b.items)).catch(() => setAll([]))
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onK = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (!open) input.current?.focus() } }
    window.addEventListener('keydown', onK); return () => window.removeEventListener('keydown', onK)
  }, [open])
  const hits = (all ?? []).filter(l => q.trim() && (l.title + ' ' + l.domain + ' ' + l.category.name).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-bg/80 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal aria-label="Search">
          <motion.div initial={{ y: -10, scale: 0.98, filter: 'blur(6px)' }} animate={{ y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ y: -10, scale: 0.98, filter: 'blur(6px)' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} onClick={e => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-2xl bg-raised shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] hairline-strong">
            <div className="flex items-center gap-3 px-4">
              <Search className="size-4 text-ink-3" />
              <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings by name, domain or category" className="h-13 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
              <kbd className="rounded-md bg-line-strong px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-2">esc</kbd>
            </div>
            {q.trim() && (
              <ul className="border-t border-line p-1.5">
                {hits.length === 0 && <li className="px-3 py-6 text-center text-sm font-medium text-ink-3">{all === null ? 'Loading…' : `Nothing listed matches “${q}”. Be the first to claim it.`}</li>}
                {hits.map(l => (
                  <li key={l.slug}>
                    <button onClick={() => { onClose(); nav(`/product/${l.slug}`) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-accent-subtle">
                      <img src={l.favicon ?? ''} alt="" className="size-7 rounded-lg bg-line-strong object-cover" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{l.title}</span><span className="block text-[12px] font-medium text-ink-3">#{l.rank} · {l.category.name}</span></span>
                      <span className="tnum font-mono text-[13px] text-accent">{rupees(l.total_paise)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
