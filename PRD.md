# Product Requirements: GoCrazy

Prepared 17 November 2026. Owner: Varun.

## 1. Problem
Early-stage Indian founders cannot afford ad auctions and get no proof that anyone saw their ad. Launch directories are free but invisible. There is no cheap, transparent way to buy attention from a founder audience.

## 2. Solution
A public leaderboard where rank is bought. Pay ₹99 and you are listed. Pay more and you climb. Everyone can see what each spot cost, how many visitors the site gets, and how many clicks every listing received. The board is the ad, the numbers are the proof.

## 3. Users
- **Buyer**: founder or indie maker with ₹99 to ₹5,000 to spend. Wants traffic, backlink, and a screenshot to post.
- **Visitor**: founder, investor, builder browsing for new products. Wants a fast, scannable list.
- **Operator**: one person running the site. Wants zero manual steps per sale.

## 4. Scope (v1, shipped)
| Area | Requirement | Status |
| --- | --- | --- |
| Boards | All-time, Today (IST reset), Daily archive, per-category, Deals | Done |
| Claim | URL or @handle, category, amount stepper, live rank quote, terms checkbox | Done |
| Pricing | Min ₹99 new; #1 = current + ₹100; other rank = current + ₹10; raise = difference, min ₹10 | Done |
| Payments | Razorpay order → checkout → signature verify → webhook (idempotent) | Done |
| Listing data | Title, description, favicon auto-fetched; query strings stripped; shorteners resolved | Done |
| Product page | Ranks overall/category/deals, outrank price Q&A, ledger, "also in category" | Done |
| Categories page | Hottest 3 + grid of all 30 with top 3 | Done |
| Stats | Online now, visitors today, total visitors, revenue from DataFast; listings count from DB; hidden until DataFast reports data | Done |
| Clicks | `/out/{slug}` redirect with utm tag, counted per listing | Done |
| Search | Header search across listings (Ctrl/⌘ K) | Done |
| Policy pages | Rules, FAQ, Terms, Refunds, Privacy, Contact; business details from config | Done (have a lawyer review before launch) |
| Visual | Near-black dark theme only, sky-blue accent, cursor-following 3D neon tubes in the hero, page transitions, reduced-motion safe | Done |

| Startup details | Location, stage, X, LinkedIn, WhatsApp and email on the listing page | Done |
| Hosting | Vercel (static + Python function), Neon Postgres | Ready |

## 5. Out of scope for v1
Accounts/login, email digests, admin dashboard, OG image generation, multi-currency, GST invoices, comments or voting.

## 6. Success metrics
- 20 paying founders within 2 weeks of launch.
- Median claim-to-rank time under 10 seconds.
- Zero double-counted payments.
- Stats strip shows live DataFast numbers within 60 seconds of a payment.

## 7. Risks
- Traffic chicken-and-egg: the board is worthless without visitors. Mitigation: niche (student/college founders), weekly newsletter, honest stats.
- Whale lock-in on All-time. Mitigation: Today and Daily boards.
- Legal: paid ads labelling, DPDP Act for contact details, Razorpay activation needs policy pages. All in place as drafts.

## 8. Open decisions
- Niche: all Indian startups vs student/college founders.
- GST inclusive vs added at checkout.
- Deals board cadence (currently quarterly, closes 31 Dec 2026 IST).
