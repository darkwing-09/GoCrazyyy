import { Link } from 'react-router-dom'
import { useAppData } from '@/lib/app-data'

export function Footer() {
  const { stats } = useAppData()
  const links = [['/rules', 'Rules'], ['/faq', 'FAQ'], ['/terms', 'Terms'], ['/refunds', 'Refunds'], ['/privacy', 'Privacy'], ['/contact', 'Contact']]
  return (
    <footer className="mx-auto mt-20 max-w-[1120px] px-4 pb-10 text-center text-[12.5px] text-ink-3 sm:px-6">
      <div className="border-t border-line pt-8">
        <p>Every placement on GoCrazy is a paid advertisement. Ranks are bought, not earned.</p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {links.map(([to, l]) => <Link key={to} to={to} className="hover:text-ink">{l}</Link>)}
          {stats?.public_stats_url && <a href={stats.public_stats_url} target="_blank" rel="noreferrer" className="hover:text-ink">Live stats</a>}
        </p>
        <p className="mt-3">Made in India · prices in ₹ · payments by Razorpay · analytics by DataFast</p>
      </div>
    </footer>
  )
}
