import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { useAppData } from '@/lib/app-data'
import { rupeesPlain } from '@/lib/format'

function Doc({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <PageShell>
      <article className="prose-gc mx-auto mt-10 max-w-[68ch]">
        <h1 className="display balance text-[2.25rem] leading-tight font-bold">{title}</h1>
        {lede && <p className="mt-3 text-[15.5px] text-ink-2">{lede}</p>}
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-2 [&_h2]:display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mb-2 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-ink">
          {children}
        </div>
        <p className="mt-12 text-[12.5px] font-medium text-ink-3">Last updated 17 November 2026 · <Link to="/contact" className="hover:text-ink">Contact</Link></p>
      </article>
    </PageShell>
  )
}

export function Rules() {
  const { meta } = useAppData()
  const p = meta?.pricing
  return (
    <Doc title="Rules" lede="Short, because the mechanism is simple: the total you have paid is your rank.">
      <section><h2>Boards</h2><ul>
        <li><strong>All-time</strong>: every captured payment for a listing, ever.</li>
        <li><strong>Today</strong>: payments since midnight IST. Resets daily.</li>
        <li><strong>Daily</strong>: one frozen board per IST day, kept forever.</li>
        <li><strong>Category</strong>: the same as All-time, filtered to one category. Every category prices its #1 separately.</li>
        <li><strong>Deals</strong>: a separate board for discounts. A deal must describe a real discount; a coupon code is optional.</li>
      </ul></section>
      <section><h2>How ranking works</h2><ul>
        <li>Rank is the sum of all payments for a listing. ₹100 + ₹200 + ₹300 = ₹600.</li>
        <li>Ties go to the older listing. To take a rank you must pay strictly more than it.</li>
        <li>A new listing costs at least ₹{p ? rupeesPlain(p.min_new) : 99}. Taking #1 costs the current #1 plus ₹{p ? rupeesPlain(p.take_top_bump) : 100}. Any other rank costs that rank's total plus ₹{p ? rupeesPlain(p.rank_bump) : 10}.</li>
        <li>Raising a listing you already own charges only the difference, minimum ₹{p ? rupeesPlain(p.min_raise) : 10}.</li>
        <li>Nobody can take your rank by paying "the difference". They must beat your full total.</li>
        <li>Rank is assigned when Razorpay confirms the capture, usually within seconds.</li>
      </ul></section>
      <section><h2>What you can list</h2><ul>
        <li>A product, company, project or profile with a working URL, or an @handle on X.</li>
        <li>Query strings are stripped and link shorteners are resolved. The listing shows the final domain.</li>
        <li>Title, description and icon are read from the page. Pick a category; we may move a listing that is clearly in the wrong one.</li>
        <li>No adult content, gambling, weapons, counterfeit goods, scams, or anything illegal in India. We remove these without refund.</li>
      </ul></section>
      <section><h2>After you pay</h2><ul>
        <li>Your listing goes live with its rank, a "see details" page and an outbound link tagged <code>utm_source=gocrazy</code> so you can see the traffic in your own analytics.</li>
        <li>Every listing is labelled as a paid advertisement.</li>
        <li>Listings never expire. There are no refunds.</li>
      </ul></section>
    </Doc>
  )
}

const FAQS: [string, ReactNode][] = [
  ['How much does it cost?', 'A new listing starts at ₹99. The price of a specific rank is shown on every row ("claim this rank for ₹X"). Taking #1 costs the current #1 total plus ₹100.'],
  ['Do payments add up?', 'Yes. Everything you have ever paid for a listing counts. ₹100 now and ₹500 next month makes a ₹600 listing.'],
  ['Can someone outrank me by paying ₹10 more?', 'They have to pay more than your full total, not the difference. Only you get to raise by the difference.'],
  ['What happens on a tie?', 'The older listing wins. The newer one needs to pay strictly more.'],
  ['What is the Today board?', 'Spend since midnight IST. It resets daily, so a small budget can own a day even when All-time is locked by big spenders. Every day is archived on the Daily page.'],
  ['What is the Deals board?', 'A separate list for discounts. You describe the offer (up to 100 characters) and optionally add a coupon code. Deals must be real.'],
  ['Can I list an idea with no website?', 'You need a working URL or an X handle. Idea-stage listings are fine, but they are public, so do not post anything you are not ready for others to see.'],
  ['How do I pay?', 'Through Razorpay: UPI, cards, netbanking and wallets. Prices are in rupees and include GST where it applies.'],
  ['Are there refunds?', 'No. A rank is assigned the moment payment is confirmed and the placement is delivered immediately. See the Refund policy.'],
  ['Does my listing expire?', 'No. All-time totals are kept forever.'],
  ['How many listings can I have?', 'One per domain or handle. Paying again for the same domain raises that listing.'],
  ['Can I change my category, title or description?', 'Title and description are read from your page; update the page and contact us to re-fetch. Category changes are by request.'],
  ['Where do the visitor numbers come from?', 'Site traffic is measured by DataFast, an independent analytics service, and updated every minute. Clicks on each listing are counted by our own redirect and tagged with utm_source=gocrazy so you can verify them.'],
  ['Can you remove my listing?', 'Yes, on request, without refund. We also remove listings that break the rules.'],
  ['How do I contact you?', <>Through the <Link to="/contact" className="text-accent">contact page</Link>.</>],
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Doc title="FAQ">
      <div className="divide-y divide-line">
        {FAQS.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(o => o === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-[15px] font-medium text-ink hover:text-accent">
              {q}<span className={`text-ink-3 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out-expo ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="pb-4 text-ink-2">{a}</p></div></div>
          </div>
        ))}
      </div>
    </Doc>
  )
}

export function Terms() {
  const { meta } = useAppData()
  const name = meta?.business.name ?? 'GoCrazy'
  const city = meta?.business.jurisdiction
  return (
    <Doc title="Terms of service" lede="Plain-language terms. By claiming a rank you agree to them.">
      <section><h2>1. What this is</h2><p>{name} operates GoCrazy and sells paid placements on public leaderboards. Every listing is an advertisement and is labelled as one. We do not endorse any listed product.</p></section>
      <section><h2>2. Who can buy</h2><p>You must be 18 or older and able to enter a contract. If you list on behalf of a company, you confirm you are allowed to.</p></section>
      <section><h2>3. Payments and taxes</h2><p>Prices are in Indian rupees and processed by Razorpay. The price shown includes GST where it applies. You are responsible for any other taxes. Payments add to your listing's total and are never returned.</p></section>
      <section><h2>4. No refunds</h2><p>The placement is delivered the instant a payment is captured, so there are no refunds, including when your rank is later overtaken or your listing is removed for breaking the rules. See the <Link to="/refunds" className="text-accent">Refund policy</Link>.</p></section>
      <section><h2>5. Your listing</h2><p>You must list a real product, company, project or profile with accurate details. You give us a licence to show the title, description and icon read from your page, and to link to it. We may fix or re-fetch these details.</p></section>
      <section><h2>6. Prohibited listings</h2><p>Adult content, gambling, weapons, drugs, counterfeit goods, scams, hate, harassment, malware, or anything illegal in India. We decide what qualifies.</p></section>
      <section><h2>7. Removal</h2><p>We may remove or re-categorise any listing at any time, with or without reason, without refund. You may ask us to remove your listing; totals are not refunded.</p></section>
      <section><h2>8. Warranties and liability</h2><p>The service is provided as is. We do not promise any amount of traffic, clicks or sales. To the extent allowed by law our liability is limited to the amount you paid in the previous 30 days.</p></section>
      <section><h2>9. Emails</h2><p>If you give an email we use it for the receipt and for service messages about your listing. No marketing without consent.</p></section>
      <section><h2>10. Governing law</h2><p>These terms are governed by the laws of India.{city ? <> The courts of {city} have exclusive jurisdiction.</> : <> Disputes are subject to the courts of competent jurisdiction in India.</>}</p></section>
    </Doc>
  )
}

export function Refunds() {
  return (
    <Doc title="Refund and cancellation policy" lede="How payments, refunds and cancellations work on GoCrazy.">
      <section><h2>No refunds</h2><p>A placement is delivered the moment your payment is captured: your listing appears at its rank immediately. Because the service is consumed instantly, payments are not refundable and cannot be cancelled.</p></section>
      <section><h2>Failed or duplicate charges</h2><p>If money left your account but your rank did not appear within 15 minutes, contact us with the Razorpay payment id. Genuine failed captures are reversed by Razorpay automatically, usually within 5 to 7 working days. If a technical fault on our side double-charged you, we refund the duplicate.</p></section>
      <section><h2>Removed listings</h2><p>Listings removed for breaking the rules are not refunded.</p></section>
    </Doc>
  )
}

export function Privacy() {
  return (
    <Doc title="Privacy policy">
      <section><h2>What we collect</h2><ul>
        <li><strong>Listing data</strong>: the URL you submit and the public title, description and icon read from it. This is published.</li>
        <li><strong>Payment data</strong>: Razorpay's order and payment ids, the amount, and the email or phone you gave at checkout. Card and bank details never reach us; Razorpay handles them.</li>
        <li><strong>Analytics</strong>: page views and a visitor identifier set by DataFast's script, used to count visitors and attribute revenue. Click-throughs on listings are logged by our redirect.</li>
      </ul></section>
      <section><h2>How we use it</h2><p>To show the leaderboard, send receipts, prevent abuse, and publish aggregate traffic numbers. We do not sell personal data.</p></section>
      <section><h2>Cookies</h2><p>DataFast sets a first-party analytics cookie. Your light or dark theme choice is stored in your browser only.</p></section>
      <section><h2>Your rights (DPDP Act 2023)</h2><p>You may ask what personal data we hold, ask for corrections, or ask for deletion of your contact details. Listing totals are a public record of payments and are retained. Write to us via the <Link to="/contact" className="text-accent">contact page</Link>.</p></section>
      <section><h2>Processors</h2><p>Razorpay (payments), DataFast (analytics), and our hosting provider.</p></section>
    </Doc>
  )
}

export function Contact() {
  const { meta } = useAppData()
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 1500); return () => clearTimeout(t) } }, [copied])
  const b = meta?.business
  return (
    <Doc title="Contact" lede="We reply within one working day.">
      {b?.email && <section><h2>Email</h2><p><a href={`mailto:${b.email}`} className="font-mono text-accent hover:underline">{b.email}</a> <button onClick={() => navigator.clipboard.writeText(b.email!).then(() => setCopied(true))} className="ml-2 text-[13px] font-medium text-ink-2 hover:text-ink">{copied ? 'Copied' : 'Copy'}</button></p></section>}
      {(b?.name || b?.address) && <section><h2>Business</h2><p className="whitespace-pre-line"><strong>{b?.name}</strong>{b?.address && <><br />{b.address}</>}</p></section>}
      <section><h2>For payment issues</h2><p>Send the Razorpay payment id (starts with <code>pay_</code>), the listing URL and the amount.</p></section>
      <section><h2>For takedowns</h2><p>Send the listing URL and the reason. Rule-breaking listings come down the same day.</p></section>
    </Doc>
  )
}
