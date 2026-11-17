import { Link } from 'react-router-dom'
import { PageShell, Reveal } from '@/components/PageShell'
import { StatsStrip } from '@/components/StatsStrip'
import { Button } from '@/components/Button'

export function About() {
  return (
    <PageShell>
      <article className="mx-auto mt-10 max-w-[68ch]">
        <h1 className="display balance text-[2.25rem] leading-tight font-bold sm:text-[2.75rem]">Advertising is expensive. A placement is ₹9.</h1>
        <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-2">
          <p>GoCrazy is a public directory where Indian startups buy advertising placement. There is no jury, no upvotes and no algorithm. Placement is set by advertising spend: the more you spend, the higher your listing features, and every rupee you spend keeps counting.</p>
          <p>Early-stage founders get the worst deal in advertising: small budgets, prices set by large brands, and no proof that anyone saw the ad. On GoCrazy the proof is the board itself. Every row shows its clicks and its price, so anyone can see exactly what a placement costs.</p>
          <p>It is built for India: prices in rupees, UPI, cards and netbanking through Razorpay, and a Today board that resets at midnight IST so a small budget can lead a day even when the All-time board is held by larger spenders.</p>
        </div>
        <Reveal className="mt-10">
          <h2 className="display text-xl font-semibold">How the money works</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-ink-2">
            <li>A new listing starts at ₹9. Taking any rank, including #1, costs that rank's current total plus ₹10.</li>
            <li>Advertising spend adds up. ₹100 then ₹200 then ₹300 is a ₹600 listing. Raising your own placement charges only the difference.</li>
            <li>Your placement goes live the moment Razorpay confirms the payment. No refunds. Full rules on the <Link to="/rules" className="text-accent underline-offset-4 hover:underline">Rules page</Link>.</li>
          </ul>
        </Reveal>
        <Reveal className="mt-10">
          <h2 className="display text-xl font-semibold">Transparent numbers</h2>
          <p className="mt-3 text-[15px] text-ink-2">Site traffic is measured by independent analytics and published openly. Clicks on every listing are counted by our own redirect and tagged with <code className="font-mono text-[13px]">utm_source=gocrazy</code>, so you can verify the traffic in your own analytics too.</p>
        </Reveal>
        <div className="mt-10"><Link to="/"><Button size="lg">Feature your startup</Button></Link></div>
      </article>
      <StatsStrip />
    </PageShell>
  )
}
