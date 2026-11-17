export type Category = { slug: string; name: string; icon: string }
export type Listing = {
  rank: number; slug: string; title: string; description: string; url: string; domain: string
  favicon: string | null; category: Category; total_paise: number; clicks: number
  published_at: string; last_paid_at: string | null; deal_text: string | null; coupon: string | null
  take_price_paise: number | null
  contact_email?: string | null
  twitter?: string | null
  linkedin?: string | null
  location?: string | null
  stage?: string | null
  contact_phone?: string | null
}
export type Activity = { slug: string; title: string; favicon: string | null; amount_paise: number; at: string; board: string; category: Category }
export type Board = 'alltime' | 'today' | 'deals' | 'daily'
export type Meta = {
  payments_mode: 'razorpay' | 'mock'; payments_available: boolean; razorpay_key_id: string | null; datafast_website_id: string | null
  datafast_domain: string | null; public_stats_url: string | null; launched_at: string | null; deals_closes_at: string | null
  business: { name: string; email: string | null; address: string | null; jurisdiction: string | null }
  pricing: { min_new: number; take_top_bump: number; rank_bump: number; min_raise: number; step: number; max: number; min_new_deal: number; take_top_bump_deal: number }
}
export type Home = {
  alltime: { items: Listing[]; total: number; pages: number; take_top_paise: number }
  today: { items: Listing[]; total: number }
  deals: { items: Listing[]; total: number; take_top_paise: number }
  activity: Activity[]
}
export type BoardPage = { board: Board; category: string | null; day: string | null; total: number; page: number; pages: number; items: Listing[]; take_top_paise: number; activity: Activity[] }
export type Quote = { rank: number; min_paise: number; projected_total_paise: number; take_top_paise: number; existing: { slug: string; title: string; current_rank: number | null; total_paise: number } | null }
export type Stats = { source: string; online: number | null; visitors_today: number | null; visitors_total: number | null; revenue_paise: number; revenue_source: string; products: number; public_stats_url: string | null }
export type CategoryCard = Category & { claims: number; last_claim_at: string | null; top: Listing[]; take_top_paise: number }
export type Product = Listing & {
  overall: { rank: number | null; of: number; outrank_paise: number | null }
  category_rank: { rank: number | null; of: number }
  deals_rank: { rank: number | null; of: number; total_paise: number }
  raise_count: number; first_paid_at: string | null
  ledger: { amount_paise: number; at: string; board: string }[]; also: Listing[]
}
export type Day = { day: string; live: boolean; count: number; revenue_paise: number; top: Listing[] }
export type ClaimResult = {
  order_id: string; amount_paise: number; currency: string; key_id: string | null; mode: 'razorpay' | 'mock'
  listing: { slug: string; title: string; favicon: string | null; domain: string; is_new: boolean }
  projected_rank: number; projected_total_paise: number
}
export type PayResult = { ok: boolean; slug: string; title: string; rank: number | null; total_paise: number; board: string; of: number }

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!r.ok) {
    let msg = r.statusText
    try { msg = (await r.json()).detail ?? msg } catch { /* keep statusText */ }
    throw new ApiError(r.status, typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return r.json()
}
const qs = (o: Record<string, string | number | null | undefined>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  meta: () => req<Meta>('/api/meta'),
  stats: () => req<Stats>('/api/stats'),
  categories: () => req<{ categories: CategoryCard[]; hottest: string[] }>('/api/categories'),
  home: (category?: string | null) => req<Home>(`/api/home${qs({ category })}`),
  board: (board: Board, o: { category?: string | null; day?: string | null; page?: number } = {}) =>
    req<BoardPage>(`/api/board${qs({ board, ...o })}`),
  quote: (o: { amount_paise: number; category?: string | null; board?: 'main' | 'deals'; url?: string }) => req<Quote>(`/api/quote${qs(o)}`),
  listing: (slug: string) => req<Product>(`/api/listing/${encodeURIComponent(slug)}`),
  daily: () => req<{ days: Day[]; resets_at?: string }>('/api/daily'),
  claim: (body: object) => req<ClaimResult>('/api/claims', { method: 'POST', body: JSON.stringify(body) }),
  verify: (body: object) => req<PayResult>('/api/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  mockPay: (orderId: string) => req<PayResult>(`/api/payments/mock/${orderId}`, { method: 'POST' }),
}
