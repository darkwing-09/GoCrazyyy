# Rules (as implemented)

Source of truth: `backend/app/pricing.py`, `backend/app/boards.py`, `backend/app/main.py:create_claim`. The public Rules page (`/rules`) renders these numbers from `/api/meta`.

## Money
- Currency INR. Stored as integer paise. Displayed in en-IN format with no decimals (₹1,71,260).
- Whole-rupee amounts only (`amount_paise % 100 == 0`).
- Per-payment ceiling ₹5,00,000 (`MAX_AMOUNT`). Razorpay method limits (UPI ≈ ₹1,00,000 per transaction) apply below that.

## Ranking
| Rule | Value |
| --- | --- |
| Rank | Sum of captured payments for the listing within the board's window, descending |
| Tie | Older `published_at` wins; a newcomer must pay strictly more |
| Cumulative | ₹100 + ₹200 + ₹300 = ₹600 |
| New listing minimum | ₹99 (`MIN_NEW_LISTING`) |
| Take #1 | current #1 total + ₹100 (`TAKE_TOP_BUMP`) |
| Take rank N>1 | current rank-N total + ₹10 (`RANK_BUMP`) |
| Raise own listing | pay the difference, minimum ₹10 (`MIN_RAISE`) |
| Stepper step | ₹10 (`STEP`) |
| Rank assigned | when the capture is recorded (verify endpoint or webhook, whichever first) |

## Boards
| Board | Window | Payment `board` |
| --- | --- | --- |
| All-time | all | `main` |
| Today | since 00:00 IST today | `main` |
| Daily `/daily/YYYY-MM-DD` | that IST day | `main` |
| Category | All-time filtered by category | `main` |
| Deals | all | `deals` (new deal minimum ₹49, take #1 = +₹10) |

A payment made on the Deals board counts only there. A payment on the main board counts on All-time, Today, Daily and the listing's category.

## Listings
- One listing per domain (`www.` stripped). An `@handle` lists `https://x.com/handle`, one per handle.
- Query strings and fragments are stripped; redirects (shorteners) are resolved before the domain is read.
- Title, description and favicon are read from the page's OG/meta tags; fallbacks are the domain and Google's favicon service.
- A listing is unpublished until its first capture. Unpaid orders leave an invisible listing row that the next claim for the same domain reuses.
- Deals require `deal_text` (≤100 chars); `coupon` (≤60) is optional and only shown on the Deals board.
- Outbound links go through `/out/{slug}` which appends `utm_source=gocrazy&utm_medium=leaderboard` and logs a click.

## Policy
- Every placement is labelled a paid advertisement (footer and Terms).
- No refunds (see `/refunds`).
- Operator may remove or re-categorise any listing. There is no admin UI yet; do it in the database (`Issues.md`).
