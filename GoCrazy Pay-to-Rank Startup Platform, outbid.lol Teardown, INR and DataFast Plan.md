# GoCrazy: Pay-to-Rank Startup Platform, outbid.lol Teardown, INR and DataFast Plan

Prepared November 17, 2026

This doc covers the idea (founders register a startup, pay via Razorpay, and rank by cumulative payments), a page-by-page teardown of the reference site outbid.lol, and a co-founder assessment. I read the home page, About, Rules, FAQ, Terms, Categories, Daily and a product page. I did not open Today, Deals, Privacy, Imprint or individual category pages, so those are inferred from the Rules and links.

Project name: **GoCrazy**. Sections 6 to 10 add the page-by-page inventory, the dollar-to-INR rules, the DataFast plan, a council note and sources.

## 1. The idea in one paragraph

A startup founder registers a startup or idea with its name, description and contact details. They are redirected to Razorpay to pay. Once paid, the startup is listed and appears in a Top Projects list. Ranking is by total money paid: payments accumulate (for example 100, then 200, then 300 counts as 600), and every further payment adds to the total. This is almost exactly how outbid.lol works, so the teardown below is the blueprint.

## 2. outbid.lol teardown

### Global nav and header

- Logo/wordmark, a small "stats" link to a public analytics page, and a banner about switching analytics providers.
- Nav links: Daily, Categories, About (Rules is added on some pages).
- Home page category chips: All plus 29 categories (Agents, Marketing, SEO, Developer, Crypto, Health, Education, Hiring, Real Estate, Security, Writing, Audio and more).

### Home page, top to bottom

1. Three tabs: All-time, Black Friday Deals (a themed board) and Today.
2. A claim bar: "Claim #1 for − $amount +" stepper, a category dropdown and a Claim rank button. Checkout takes a URL or @handle, a category and an amount, plus a terms checkbox.
3. Two mini-boards: Black Friday Deals (top 5) and Today's ranking, each with "See all".
4. The main leaderboard, 50 per page. Each row has:
   - rank, logo, title, total paid and description
   - category chip, age, domain and click count
   - a "see details" link and a "claim this rank for $X" button (taking #1 costs the current #1 plus $5; every other rank costs plus $1)
5. A "Latest activity" feed after row 10, and a "Top 20" divider after row 20.
6. Pagination (65 pages, about 3,231 listings) and a stats strip showing visitors, revenue and products added since launch.

### Footer

- Credit line: built by the founder, brought to you by his boilerplate product.
- Links: Rules, FAQ, Terms, Privacy, Imprint, Live stats.
- An affiliate banner and a domain-rating badge.

### Other pages

| Page | What's on it |
| --- | --- |
| /product/\<slug> | Title, category, domain, age, clicks, Visit and Copy link. Category rank and overall rank (for example "#1 of 3,149"). An auto-generated Q&A block including the exact price to outrank. "Also in this category" shows 5 listings. |
| /daily | One archive board per UTC day since Aug 21 (site launched Aug 19). The live day has a countdown; past days freeze. Each shows the top 3 and "Show all ranks". |
| /categories | "Most active" categories with a "hottest" badge, then every category with its top 3. |
| /about | Launch story, buyer testimonials (embedded tweets from #1 buyers), founder card. |
| /rules, /faq, /terms | The rule set. The FAQ has about 15 questions; the Terms cover no-refund, takedown rights and listing requirements. |

### Entities

- **Listing:** URL or @handle, title and description auto-fetched from the page, favicon/OG image, category (AI-assigned for existing listings), total paid, click count, raise count, created date.
- **Payment**, **Board** (All-time, Today, Daily, Category, Deals), **Category**, **Day archive**, **Activity event**, **Click**.
- **Email subscriber** (daily or weekly digest, whole board or per category).

### Rules worth copying or fixing

- Cumulative rank, as in your idea (100 + 200 + 300 = 600).
- Ties go to the older listing.
- Raising a rank charges only the difference.
- Someone else cannot take your rank by paying that difference.
- Query strings are stripped and link shorteners are resolved.
- Rank is assigned when payment is confirmed.
- No refunds. Listings must show valid company details, and the operator can remove listings at will.
- Outbound links carry a utm\_source tag, which gives buyers attribution.

## 3. Council view

### Market seat

The "ads are expensive" pain is real. outbid sells distribution for $10 to $30 a day. The same data shows the weak point: listings went from about 380 per day at launch (Aug 21) to about 2 per day now, mostly at $10. The $12k to $17k whales paid during a viral spike of roughly 1M visitors. The About page also says at least 10 copycats appeared on day one. A plain clone gets neither the traffic nor the novelty.

### Growth seat

Buyers pay for eyeballs. Your first problem is traffic, not features. Without an audience, the ranking is worthless. A free tier, a weekly newsletter and a niche audience would bring that traffic.

### Product seat

Cumulative-only ranking lets whales lock the top forever. outbid fixes this with Today and Daily boards, and you should keep those. Publicly listing raw ideas also invites copying. Require a live URL or a prototype, or label idea-stage listings clearly.

### Payments and legal seat

This is not legal advice; verify each point.

- Razorpay activation typically needs a live site with Terms, Refund, Privacy and Contact pages.
- Paid placements should be labelled as advertisements.
- Storing founders' contact details brings DPDP Act 2023 obligations.
- Check GST on ad revenue with a CA.

### Engineering seat

In a FastAPI, Postgres and React stack, store payments as an append-only ledger and compute rank as the SUM of captured payments per listing. Use the Razorpay Orders API, then verify the signature on the payment.captured webhook and make it idempotent so retries never double-count.

## 4. Verdict

As a pure clone, pass. As a niche, India-first version with INR pricing, it is worth a weekend MVP. Pricing could start around ₹99 to ₹199, with the #1 takeover at plus ₹100. A niche could be Indian student, college and early-stage founders, with an events and newsletter audience. The real test is whether 20 founders pay before you build the polish.

## 5. Next steps

1. Pick the niche and the name.
2. Build the MVP pages: Home, Claim, Product, Today, Categories, and the policy pages (Terms, Refund, Privacy, Contact).
3. Wire Razorpay: order creation, checkout, signed and idempotent webhook, ledger table.
4. Run a 2-week paid-listing test and measure how many founders pay.

### Open decision

Which niche to target: all Indian startups, or something narrower such as student and college founders.

## 6. GoCrazy page inventory (outbid.lol reference)

Every page below was checked on outbid.lol, from your screenshots plus my earlier reads. Shared parts come first, then one row per page.

### Shared on every page

- Header: a live strip ("3 online, 719 visitors today, stats"), a search icon, a dark-mode toggle, and links to Daily, Categories and About.
- A category chip bar, with the active chip highlighted and an Explore link to /categories.
- Three tab pills: All-time, Black Friday Deals, Today (with a red live dot).
- Footer: credit line, Rules, FAQ, Terms, Privacy, Imprint, Live stats, an affiliate line and a domain-rating badge.

### Page by page

| Page | URL | What it has |
| --- | --- | --- |
| Home (All-time) | / | Hero "Claim #1 for - $17006 +" with a stepper. URL or @handle input, category dropdown and a Claim rank button that stays pale until the form is valid. Top 3 rows are tinted. Each row shows rank, logo, title, amount, description, category, age, domain, clicks, "see details" and "claim this rank for $X". Sidebar with Black Friday Deals (top 5) and Today's ranking. A Latest activity feed after row 10, a Top 20 divider, pagination at 50 per page, a stats strip and the footer. |
| Today | /today | Board of spend since midnight UTC, reset daily. Empty state reads "Nobody has claimed a rank since midnight UTC". Not opened directly; taken from the Rules and the sidebar. |
| Daily | /daily, /daily/YYYY-MM-DD | One frozen board per UTC day since Aug 21, 2026. The live day shows a countdown and listing count. Each day shows its top 3 and a "Show all ranks" link. |
| Black Friday Deals | /deals, /category/\<slug>/deals | Rule banner (a deal must give a discount) and a countdown to the end of Cyber Monday. Hero "Claim #1 in \<category> on Black Friday Deals for $15". Extra fields: discount description (0/100 characters) and coupon code. Rows carry a discount badge such as "80% off for 12 months". Latest activity strip. |
| Category | /category/\<slug> | Hero re-prices to that category's #1 plus $5 (Leaderboards $3,134, Marketing $16,005). Category is pre-selected. Own ranked list and own Deals and Today sidebars, each with an empty state when nobody has bid. |
| Categories | /categories | "Most active categories": three cards with a "hottest" badge, claim count, time since last claim and the current leader with amount. Then a 3-column grid of every category, each with icon and top 3 (logo, truncated title, amount). 29 or more categories. |
| Product | /product/\<slug> | Title, category, domain, age, clicks, Visit and Copy link. Category rank and overall rank (for example #1 of 3,149). "About this ranking" block with auto-generated Q&A including the exact price to outrank. "Also in this category" with 5 listings. |
| About | /about | Launch story, live stats, highest rank so far, founder card and embedded buyer posts from #1 buyers. |
| Rules | /rules | Boards, how ranking works, what you can list, categories, what happens after you pay. |
| FAQ | /faq | About 15 questions: cost, #1 price, boards, raising a rank, refunds, listing limits, categories, payment, expiry, contact. |
| Terms | /terms | Paid-ad status, eligibility (18+), payments and taxes, no refunds, valid company details, warranties, prohibited listings, removal rights, license, complaints, liability, governing law, product emails. |
| Privacy, Imprint | /privacy, /impressum | Legal pages. Not opened; linked from the footer. |

Stats strip numbers seen in the screenshots: 1,702,496 visitors, $269,082 revenue and 3,231 products added in the first 88 days.

## 7. Switching GoCrazy from dollars to rupees (INR)

GoCrazy prices everything in rupees and stores money as integer paise, because Razorpay works in paise (₹1 = 100 paise). The figures in the GoCrazy column are proposals to test, not fixed rules.

| Item | outbid.lol | GoCrazy (proposal) |
| --- | --- | --- |
| Currency | US dollars | INR, stored as integer paise |
| Minimum new listing | $10 | ₹99 to ₹199 |
| Taking #1 | Current #1 plus $5 | Current #1 plus ₹100 |
| Raising an existing rank | At least +$1, charges the difference | At least +₹10, charges the difference |
| Stepper step | $1 | ₹10 |
| Maximum | $999,999 | Set after checking Razorpay limits per payment method (UPI vs cards) |
| Number format | $17006 | en-IN format, for example ₹1,00,000 |
| Tax | Added at checkout where it applies | Decide GST inclusive or extra; compute it yourself and confirm with a CA |

### What to change in the build

- Database: an `amount_paise` integer column on the payment ledger and a `currency` column defaulting to `INR`. Rank is the SUM of captured payments per listing.
- Formatting: use `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0})` for every price on screen.
- Copy: replace every `$` and the word "dollars" in the UI, meta tags, OG images, Rules, FAQ and Terms with rupees.
- Rules text: keep the cumulative rank, older-listing tie-break and difference-only raise, with the INR amounts above.

## 8. Showing real stats with DataFast

Razorpay has no native DataFast integration, so GoCrazy sends each captured payment to the [DataFast Payment API](https://datafa.st/docs/api/website/payments/create) and reads headline numbers back from the [Overview API](https://datafa.st/docs/api/website/analytics/overview).

### Payment flow

1. Install the DataFast tracking script on the GoCrazy site. It sets the `datafast_visitor_id` cookie.
2. When creating a Razorpay order, read that cookie and store it in the order `notes` with the listing ID.
3. In the `payment.captured` webhook, verify the signature, write the payment to the ledger, then post it to DataFast.
4. Send the amount in rupees (paise divided by 100), currency `INR`, and the Razorpay payment ID as `transaction_id`. DataFast treats a repeated `transaction_id` as a duplicate, so webhook retries are safe.

```python
@app.post("/webhooks/razorpay")
async def rzp_webhook(req: Request):
    body = await req.body()
    client.utility.verify_webhook_signature(
        body.decode(), req.headers["X-Razorpay-Signature"], WEBHOOK_SECRET)
    evt = json.loads(body)
    if evt["event"] == "payment.captured":
        p = evt["payload"]["payment"]["entity"]
        ledger_insert(p["id"], p["amount"], p["notes"]["listing_id"])  # paise, idempotent
        await httpx.AsyncClient().post(
            "https://datafa.st/api/v1/payments",
            headers={"Authorization": f"Bearer {DATAFAST_KEY}"},  # server-side only
            json={"amount": p["amount"] / 100, "currency": "INR",
                  "transaction_id": p["id"],
                  "datafast_visitor_id": p["notes"].get("df_vid"),
                  "email": p.get("email")})
    return {"ok": True}
```

### Where users see the real numbers

| Place | How | Source of the number |
| --- | --- | --- |
| Header strip ("online now", "visitors today") | Backend calls the DataFast realtime and overview endpoints, caches about 60 seconds, exposes `/api/stats` | DataFast |
| Footer stats strip (visitors, revenue in ₹) | Same `/api/stats` endpoint | DataFast |
| Footer stats strip (products added) | Count of listings | GoCrazy database |
| "Live stats" link | Public share page from the DataFast dashboard share setting | DataFast |
| Per-listing clicks | Own `/out/<slug>` redirect that logs a click and adds a utm tag | GoCrazy database |

Rank-critical numbers such as clicks and totals paid stay in your own database. DataFast is for site-level traffic and revenue.

### Checks before launch

- Keep the DataFast API key on the server only, never in browser code.
- Set the DataFast website currency to INR and confirm payments show correctly in the dashboard.
- Check the plan's event limits against expected traffic.
- The tracking script uses a cookie: add a short consent notice for DPDP Act 2023, or look at DataFast's cookieless mode (less accurate attribution).

## 9. Council note for GoCrazy

- **Trust seat:** Real public stats are the edge over fake "as seen on" ads. They cut both ways: outbid.lol showed 719 visitors today against 1.7M in total, so honest numbers will look small early. Show them anyway, because buyers pay for traffic and should see it.
- **Legal seat:** Label placements as paid advertisements, add Terms, Refund, Privacy and Contact pages for Razorpay activation, and cover DPDP Act 2023 for stored founder contact details. This is not legal advice; confirm with a professional.
- **Engineering seat:** Build in this order: paise ledger, Razorpay webhook, DataFast post, then `/api/stats`.
- **Open decision:** the niche (all Indian startups, or student and college founders) is still unanswered.

## 10. Sources

- [outbid.lol home](https://outbid.lol/), [About](https://outbid.lol/about), [Rules](https://outbid.lol/rules), [FAQ](https://outbid.lol/faq), [Terms](https://outbid.lol/terms), [Categories](https://outbid.lol/categories), [Daily](https://outbid.lol/daily), [product page example](https://outbid.lol/product/see.io), plus screenshots supplied by you of the home, category, category deals and categories pages.
- [DataFast documentation](https://datafa.st/docs), [Create a payment](https://datafa.st/docs/api/website/payments/create), [Get overview](https://datafa.st/docs/api/website/analytics/overview).
