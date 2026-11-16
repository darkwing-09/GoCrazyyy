import { Link } from 'react-router-dom'
import { PageShell, Reveal } from '@/components/PageShell'
import { StatsStrip } from '@/components/StatsStrip'
import { Button } from '@/components/Button'

export function About() {
  return (
    <PageShell>
      <article className="mx-auto mt-10 max-w-[68ch]">
        <h1 className="display balance text-[2.25rem] leading-tight font-bold sm:text-[2.75rem]">Ads are expensive. A rank is ₹99.</h1>
        <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-2">
          <p>GoCrazy is a public leaderboard where Indian startups buy their place. There is no jury, no upvotes and no algorithm. Whoever has paid the most sits at the top, and every rupee you ever paid keeps counting.</p>
          <p>It exists because early founders get the worst deal in advertising: tiny budgets, auction prices set by big brands, and zero proof that anyone saw the ad. Here the proof is the board itself. Buyers can see the traffic numbers below, the clicks on every row, and exactly what it costs to outrank anyone.</p>
          <p>The idea is borrowed openly from pay-to-rank boards abroad. The India-first parts are ours: rupee pricing, UPI through Razorpay, a board that resets at midnight IST so a student project can own a day, and categories for campus builders and fintech.</p>
        </div>
        <Reveal className="mt-10">
          <h2 className="display text-xl font-semibold">How the money works</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-ink-2">
            <li>A new listing starts at ₹99. Taking #1 costs the current #1 plus ₹100. Any other rank costs that rank plus ₹10.</li>
            <li>Payments add up. ₹100 then ₹200 then ₹300 is a ₹600 listing. Raising your own rank charges only the difference.</li>
            <li>Rank is assigned the moment Razorpay confirms the payment. No refunds. Full rules on the <Link to="/rules" className="text-accent underline-offset-4 hover:underline">Rules page</Link>.</li>
          </ul>
        </Reveal>
        <Reveal className="mt-10">
          <h2 className="display text-xl font-semibold">Honest numbers</h2>
          <p className="mt-3 text-[15px] text-ink-2">The visitor and revenue figures on this site come straight from our DataFast analytics, refreshed every minute. Early on they will look small. We show them anyway, because you are paying for eyeballs and should know how many there are.</p>
        </Reveal>
        <div className="mt-10"><Link to="/"><Button size="lg">Claim your rank</Button></Link></div>
      </article>
      <StatsStrip />
    </PageShell>
  )
}
