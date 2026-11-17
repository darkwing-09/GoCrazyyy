import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { CategoryRail } from '@/components/CategoryRail'
import { BoardTabs, type Tab } from '@/components/BoardTabs'
import { ClaimHero, type ClaimHeroHandle } from '@/components/ClaimHero'
import { ListingRow } from '@/components/ListingRow'
import { ActivityFeed } from '@/components/ActivityFeed'
import { SideBoards } from '@/components/SideBoards'
import { StatsStrip } from '@/components/StatsStrip'
import { Countdown } from '@/components/Countdown'
import { api, type Home as HomeData, type BoardPage, type Listing } from '@/lib/api'
import { useAppData } from '@/lib/app-data'

function nextMidnightIST(): string {
  const now = new Date()
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000)
  const next = new Date(ist); next.setHours(24, 0, 0, 0)
  return new Date(next.getTime() - (330 + now.getTimezoneOffset()) * 60000).toISOString()
}

export function Home({ tab }: { tab: Tab }) {
  const { slug = null } = useParams()
  const [sp, setSp] = useSearchParams()
  const page = Math.max(1, Number(sp.get('page') ?? 1))
  const { categories, refreshStats, meta } = useAppData()
  const [home, setHome] = useState<HomeData | null>(null)
  const [boardPage, setBoardPage] = useState<BoardPage | null>(null)
  const [loading, setLoading] = useState(true)
  const hero = useRef<ClaimHeroHandle>(null)
  const [offer, setOffer] = useState<number | null>(null)
  const catName = categories.find(c => c.slug === slug)?.name

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const h = await api.home(slug)
      setHome(h)
      if (tab !== 'alltime' || page > 1) setBoardPage(await api.board(tab, { category: slug, page }))
      else setBoardPage(null)
    } finally { setLoading(false) }
  }, [slug, tab, page])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const c = Number(sp.get('claim'))
    if (c > 0 && home) { hero.current?.prefill({ amountPaise: c }); setSp({}, { replace: true }) }
  }, [home]) // eslint-disable-line react-hooks/exhaustive-deps

  const items: Listing[] = boardPage ? boardPage.items : home?.alltime.items ?? []
  const total = boardPage ? boardPage.total : home?.alltime.total ?? 0
  const pages = boardPage ? boardPage.pages : home?.alltime.pages ?? 1
  const activity = boardPage ? boardPage.activity : home?.activity ?? []
  const takeTop = tab === 'deals' ? home?.deals.take_top_paise ?? null : home?.alltime.take_top_paise ?? null
  const board = tab === 'deals' ? 'deals' : 'main'
  const onClaim = (l: Listing) => hero.current?.prefill({ amountPaise: l.take_price_paise ?? undefined })

  return (
    <PageShell>
      <CategoryRail active={slug} suffix={tab === 'alltime' ? '' : tab} />
      <BoardTabs active={tab} category={slug} />
      {tab === 'deals' && (
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[13px] font-medium text-ink-2">Every deal must offer a real discount.{meta?.deals_closes_at && <> This board closes in <Countdown to={meta.deals_closes_at} /></>}</p>
      )}
      {tab === 'today' && (
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] font-medium text-ink-2">Spend since midnight IST. Resets in <Countdown to={nextMidnightIST()} /></p>
      )}
      <ClaimHero ref={hero} board={board} category={slug} takeTopPaise={takeTop} onPaid={() => { load(); refreshStats() }} onAmountChange={setOffer} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {loading && !items.length ? <Skeleton /> : items.length === 0 ? (
            <Empty tab={tab} catName={catName} />
          ) : (
            <ol className="space-y-1">
              {items.map((l, i) => (
                <Fragment key={l.slug}>
                  <ListingRow l={l} index={i} board={tab} onClaim={onClaim} offerRatio={l.rank === 1 && offer !== null && l.total_paise > 0 ? offer / l.total_paise : undefined} />
                  {i === 9 && activity.length > 0 && <li className="list-none"><ActivityFeed items={activity} /></li>}
                  {i === 19 && items.length > 20 && <li className="my-4 flex list-none items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-ink-3 uppercase"><span className="h-px flex-1 bg-line" />Top 20 ends here<span className="h-px flex-1 bg-line" /></li>}
                </Fragment>
              ))}
            </ol>
          )}
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2 text-[13px]" aria-label="Pagination">
              <button disabled={page <= 1} onClick={() => setSp({ page: String(page - 1) })} className="rounded-full px-3 py-1.5 text-ink-2 hairline enabled:hover:text-ink disabled:cursor-not-allowed disabled:text-ink-3">← Prev</button>
              <span className="tnum font-medium text-ink-3">Page {page} of {pages} · {total} listings</span>
              <button disabled={page >= pages} onClick={() => setSp({ page: String(page + 1) })} className="rounded-full px-3 py-1.5 text-ink-2 hairline enabled:hover:text-ink disabled:cursor-not-allowed disabled:text-ink-3">Next →</button>
            </nav>
          )}
        </div>
        <SideBoards deals={home?.deals.items ?? []} today={home?.today.items ?? []} category={slug} />
      </div>
      <StatsStrip />
    </PageShell>
  )
}

function Skeleton() {
  return <ol className="space-y-1" aria-busy>{Array.from({ length: 8 }).map((_, i) => <li key={i} className="flex animate-pulse gap-4 rounded-2xl px-4 py-3"><span className="size-12 rounded-xl bg-line-strong" /><span className="flex-1 space-y-2 pt-1"><span className="block h-3.5 w-1/2 rounded bg-line-strong" /><span className="block h-3 w-3/4 rounded bg-line-strong" /></span></li>)}</ol>
}

function Empty({ tab, catName }: { tab: Tab; catName?: string }) {
  const msg = tab === 'today' ? 'Nobody has claimed a rank since midnight IST.' : tab === 'deals' ? `Nobody has listed a deal${catName ? ` in ${catName}` : ''} yet.` : `Nothing listed${catName ? ` in ${catName}` : ''} yet.`
  return (
    <div className="rounded-2xl bg-surface px-6 py-14 text-center hairline">
      <p className="display text-xl font-semibold">{msg}</p>
      <p className="mt-2 text-[13.5px] text-ink-2">The first claim takes #1 at the minimum price. <a href="#claim" className="text-accent underline-offset-4 hover:underline">Claim it</a> or <Link to="/categories" className="text-ink underline-offset-4 hover:underline">explore categories</Link>.</p>
    </div>
  )
}
