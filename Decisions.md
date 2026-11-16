# Decisions (ADRs)

## ADR-001 · Rank is derived, never stored
Date 2026-11-17 · Status accepted
Context: a cached `total` column is tempting. Decision: compute SUM over the ledger on every read. Consequence: zero drift, trivially correct refunds-never policy; cost is one grouped query per board, fine below ~100k payments.

## ADR-002 · Paise integers, INR only
Status accepted. Razorpay works in paise; floats would round. Multi-currency is out of scope.

## ADR-003 · Two capture paths, one writer
Status accepted. Both the checkout verify endpoint and the webhook call `record_capture`. Whichever arrives first records; the other is a no-op. Neither path is optional: the verify path gives instant UI feedback, the webhook survives closed tabs.

## ADR-004 · Boards reset on IST, not UTC
Status accepted. outbid resets at UTC; our buyers are in India and "today" should mean their today.

## ADR-005 · Deals is a separate ledger board
Status accepted. A payment is either `main` or `deals`. Mixing them would let a ₹49 deal count on All-time.

## ADR-006 · Mock checkout when keys are absent
Status accepted. Lets anyone run the full claim flow locally and in CI without Razorpay credentials. The dialog says it is a mock and the server refuses the mock endpoint when real keys exist.

## ADR-007 · SQLite first, Postgres when needed
Status accepted. Single-file DB with WAL is enough for launch; `DATABASE_URL` swaps it out.

## ADR-008 · Site stats from DataFast, listing stats from our DB
Status accepted. Visitors/revenue are site-level marketing numbers; clicks and totals are rank-critical and must not depend on a third party.

## ADR-009 · Visual direction pinned by the brief (no concept roll)
Status accepted. The user pinned near-black, switchable neon accent, light-based motion; impeccable's direction roll was skipped and `seed: none (pinned)` recorded. Amber was excluded from the accent set per the user's standing preference.

## ADR-010 · Body face Schibsted Grotesk, mono Spline Sans Mono
Status accepted. Geist was the first pick; the design detector flagged it as overused and the craft reference lists it. Bricolage Grotesque stays as the display voice.
