import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Rocket,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { PageShell, Reveal } from '@/components/PageShell'
import { ListingRow } from '@/components/ListingRow'
import { Button } from '@/components/Button'
import { CatIcon, LinkedInIcon, XIcon } from '@/components/Icon'
import { api, type Product as P } from '@/lib/api'
import { count, istDate, rupees, timeAgo } from '@/lib/format'
import { NotFound } from './NotFound'

export function Product() {
  const { slug = '' } = useParams()
  const [p, setP] = useState<P | null>(null)
  const [missing, setMissing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setP(null)
    api.listing(slug).then(setP).catch(() => setMissing(true))
  }, [slug])

  if (missing) return <NotFound />
  if (!p)
    return (
      <PageShell>
        <div className="h-80 animate-pulse rounded-3xl bg-surface/50 mt-10" />
      </PageShell>
    )

  const copy = () => {
    navigator.clipboard.writeText(`${location.origin}/product/${p.slug}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const outrank = p.overall.outrank_paise

  const twitterUrl = p.twitter
    ? p.twitter.startsWith('http')
      ? p.twitter
      : `https://x.com/${p.twitter.replace('@', '')}`
    : null

  const linkedinUrl = p.linkedin
    ? p.linkedin.startsWith('http')
      ? p.linkedin
      : `https://linkedin.com/in/${p.linkedin}`
    : null

  const phoneDigits = p.contact_phone ? p.contact_phone.replace(/[^0-9]/g, '') : null
  const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : null

  const hasContacts = !!(p.twitter || p.linkedin || p.contact_email || p.contact_phone || p.location || p.stage)

  return (
    <PageShell>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_310px]">
        <div>
          {/* Main Hero Header */}
          <div className="flex items-start gap-4">
            <img
              src={p.favicon ?? ''}
              alt=""
              className="size-16 rounded-2xl bg-raised object-cover ring-1 ring-line-strong shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {p.stage && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    <Rocket className="size-3" />
                    {p.stage}
                  </span>
                )}
                {p.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-0.5 text-[11.5px] font-medium text-ink-2">
                    <MapPin className="size-3 text-accent" />
                    {p.location}
                  </span>
                )}
              </div>

              <h1 className="display balance text-[1.85rem] leading-tight font-bold sm:text-[2.35rem]">
                {p.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink-3">
                <Link
                  to={`/category/${p.category.slug}`}
                  className="inline-flex items-center gap-1 text-ink-2 hover:text-accent transition-colors"
                >
                  <CatIcon name={p.category.icon} className="size-3.5 text-accent" />
                  {p.category.name}
                </Link>
                <span>·</span>
                <span>{p.domain}</span>
                <span>·</span>
                <span>listed {timeAgo(p.published_at)}</span>
                <span>·</span>
                <span className="tnum">{count(p.clicks)} {p.clicks === 1 ? 'click' : 'clicks'}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-[68ch] text-[15.5px] leading-relaxed text-ink-2">
            {p.description || 'No description provided.'}
          </p>

          {/* Action & Contact Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a href={`/out/${p.slug}`} target="_blank" rel="noreferrer nofollow sponsored">
              <Button>
                Visit {p.domain}
                <ExternalLink className="size-4" />
              </Button>
            </a>

            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noreferrer noopener">
                <Button variant="outline">
                  <XIcon className="size-3.5 text-accent" />
                  {p.twitter?.startsWith('@') ? p.twitter : `@${p.twitter}`}
                </Button>
              </a>
            )}

            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noreferrer noopener">
                <Button variant="outline">
                  <LinkedInIcon className="size-3.5 text-accent" />
                  LinkedIn
                </Button>
              </a>
            )}

            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer noopener">
                <Button variant="outline">
                  <Phone className="size-3.5 text-accent" />
                  WhatsApp
                </Button>
              </a>
            )}

            {p.contact_email && (
              <a href={`mailto:${p.contact_email}?subject=Inquiry via GoCrazy for ${encodeURIComponent(p.title)}`}>
                <Button variant="outline">
                  <Mail className="size-3.5 text-accent" />
                  Contact
                </Button>
              </a>
            )}

            <Button variant="ghost" onClick={copy}>
              {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Share'}
            </Button>
          </div>

          {/* Ranking & Advertisement Details */}
          <Reveal className="mt-12">
            <h2 className="display text-xl font-bold tracking-tight">About this ranking</h2>
            <dl className="mt-4 space-y-4 text-[14.5px] leading-relaxed">
              {p.overall.rank && (
                <div>
                  <dt className="font-semibold text-ink">
                    How much does it cost to outrank {p.title.split(' · ')[0]}?
                  </dt>
                  <dd className="mt-1 text-ink-2">
                    {p.title.split(' · ')[0]} has paid{' '}
                    <span className="tnum font-mono text-ink font-semibold">{rupees(p.total_paise)}</span> in total
                    and sits at <span className="text-accent font-semibold">#{p.overall.rank}</span> of {p.overall.of}{' '}
                    overall. Taking that rank costs{' '}
                    <span className="tnum font-mono text-ink font-semibold">{rupees(outrank!)}</span> right now (
                    the current total plus ₹10).{' '}
                    <Link to="/" className="text-accent underline underline-offset-4 hover:brightness-125">
                      Claim it on the board
                    </Link>
                    .
                  </dd>
                </div>
              )}
              {p.category_rank.rank && (
                <div>
                  <dt className="font-semibold text-ink">Where does it rank in {p.category.name}?</dt>
                  <dd className="mt-1 text-ink-2">
                    <span className="text-accent font-semibold">#{p.category_rank.rank}</span> of {p.category_rank.of}{' '}
                    in{' '}
                    <Link
                      to={`/category/${p.category.slug}`}
                      className="text-ink underline underline-offset-4 hover:text-accent"
                    >
                      {p.category.name}
                    </Link>
                    .
                  </dd>
                </div>
              )}
              {p.deals_rank.rank && (
                <div>
                  <dt className="font-semibold text-ink">Is there a special offer or deal?</dt>
                  <dd className="mt-1 text-ink-2">
                    Yes: <span className="text-ink font-medium">{p.deal_text}</span>
                    {p.coupon && (
                      <>
                        {' '}
                        with coupon code{' '}
                        <code className="rounded border border-accent/30 bg-accent-subtle px-1.5 py-0.5 font-mono text-[13px] text-accent">
                          {p.coupon}
                        </code>
                      </>
                    )}
                    . It ranks #{p.deals_rank.rank} on the{' '}
                    <Link to="/deals" className="text-accent underline underline-offset-4">
                      Deals board
                    </Link>
                    .
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-ink">How was this rank achieved?</dt>
                <dd className="mt-1 text-ink-2">
                  {p.raise_count} payment{p.raise_count === 1 ? '' : 's'} since{' '}
                  {p.first_paid_at ? istDate(p.first_paid_at) : '—'}. Every rupee paid adds to the total; the total
                  determines the placement on the leaderboard.
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        {/* Sidebar Cards */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {/* Rank & Outrank Card */}
          <div
            className="rounded-3xl bg-surface/95 p-5.5 backdrop-blur-xl hairline shadow-md"
            style={{ boxShadow: 'inset 0 0 0 1px var(--accent-subtle), var(--accent-glow)' }}
          >
            <div className="text-[12px] font-semibold text-ink-3">Overall rank</div>
            <div className="display tnum mt-1 text-4xl font-extrabold text-accent">
              #{p.overall.rank ?? '—'}
              <span className="ml-1 text-base font-medium text-ink-3">of {p.overall.of}</span>
            </div>
            <div className="mt-3 text-[12px] font-semibold text-ink-3">Total paid (Ad Spend)</div>
            <div className="tnum font-mono text-xl font-bold">{rupees(p.total_paise)}</div>
            {outrank && (
              <Link to={`/?claim=${outrank}`}>
                <Button className="mt-4.5 w-full">Outrank for {rupees(outrank)}</Button>
              </Link>
            )}
          </div>

          {/* Startup Contacts & Inquiries Card */}
          {hasContacts && (
            <div className="rounded-3xl bg-surface/95 p-5 backdrop-blur-xl hairline shadow-sm space-y-3">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
                <MessageSquare className="size-4 text-accent" />
                Startup & Founder Contacts
              </h2>

              <ul className="space-y-2 text-[12.5px]">
                {p.location && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <MapPin className="size-3.5 text-accent" /> Location
                    </span>
                    <span className="font-medium text-ink">{p.location}</span>
                  </li>
                )}

                {p.stage && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <Rocket className="size-3.5 text-accent" /> Stage
                    </span>
                    <span className="font-medium text-accent">{p.stage}</span>
                  </li>
                )}

                {p.twitter && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <XIcon className="size-3.5 text-accent" /> X (Twitter)
                    </span>
                    <a
                      href={twitterUrl!}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent hover:underline font-medium"
                    >
                      {p.twitter}
                    </a>
                  </li>
                )}

                {p.linkedin && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <LinkedInIcon className="size-3.5 text-accent" /> LinkedIn
                    </span>
                    <a
                      href={linkedinUrl!}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent hover:underline font-medium truncate max-w-[140px]"
                    >
                      Profile ↗
                    </a>
                  </li>
                )}

                {p.contact_email && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <Mail className="size-3.5 text-accent" /> Email
                    </span>
                    <a
                      href={`mailto:${p.contact_email}`}
                      className="text-ink hover:text-accent transition truncate max-w-[150px]"
                    >
                      {p.contact_email}
                    </a>
                  </li>
                )}

                {p.contact_phone && (
                  <li className="flex items-center justify-between text-ink-2">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3">
                      <Phone className="size-3.5 text-accent" /> WhatsApp
                    </span>
                    <a
                      href={whatsappUrl!}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent hover:underline font-medium"
                    >
                      {p.contact_phone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Payment History Card */}
          <div className="rounded-3xl bg-surface/95 p-5 backdrop-blur-xl hairline shadow-sm">
            <h2 className="text-[13px] font-bold text-ink">Payment history</h2>
            <ol className="mt-2.5 space-y-1.5 text-[12.5px]">
              {p.ledger.map((e, i) => (
                <li key={i} className="flex justify-between text-ink-2">
                  <span>
                    {istDate(e.at)}
                    {e.board === 'deals' && <span className="ml-1 text-ink-3">· deals</span>}
                  </span>
                  <span className="tnum font-mono text-ink font-medium">{rupees(e.amount_paise)}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {p.also.length > 0 && (
        <Reveal className="mt-16">
          <h2 className="display mb-3 text-xl font-bold">Also in {p.category.name}</h2>
          <ol className="space-y-1.5">
            {p.also.map((l, i) => (
              <ListingRow key={l.slug} l={l} index={i} />
            ))}
          </ol>
        </Reveal>
      )}
    </PageShell>
  )
}
