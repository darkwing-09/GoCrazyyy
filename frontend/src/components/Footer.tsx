import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAppData } from '@/lib/app-data'

const LINKS: [string, string][] = [['/rules', 'Rules'], ['/faq', 'FAQ'], ['/terms', 'Terms'], ['/refunds', 'Refunds'], ['/privacy', 'Privacy'], ['/contact', 'Contact']]

export function Footer() {
  const { stats, meta } = useAppData()
  const name = meta?.business.name ?? 'GoCrazy'
  return (
    <footer className="mx-auto mt-20 w-full max-w-[1120px] px-4 pb-10 text-center text-[12.5px] font-medium text-ink-3 sm:px-6">
      <div className="border-t border-line pt-8">
        <p>Every placement on GoCrazy is a paid advertisement. Ranks are bought, not earned.</p>
        <nav aria-label="Footer" className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {LINKS.map(([to, l]) => <Link key={to} to={to} className="text-ink-2 hover:text-ink">{l}</Link>)}
          {stats?.public_stats_url && <a href={stats.public_stats_url} target="_blank" rel="noreferrer" className="text-ink-2 hover:text-ink">Live stats</a>}
        </nav>
        <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-x-2">
          <span>© {new Date().getFullYear()} {name}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-accent" strokeWidth={1.75} />Payments secured by Razorpay</span>
          <span aria-hidden>·</span>
          <span>Prices in ₹ incl. GST</span>
        </p>
      </div>
    </footer>
  )
}
