# Prompts

Reusable prompts for agents working on this repo. Paste with the file paths they name.

## Add a feature end to end
> Implement <feature> in GoCrazy. Read CLAUDE.md, Architecture.md and API.md first. Keep money as paise, rank derived from the ledger, and the accent from CSS variables. Add or update backend tests in backend/tests, type-check the frontend with `npx tsc -b`, update API.md / Rules.md / Changelog.md, and finish with a 1440 px and 390 px screenshot of every page you touched.

## Review a change
> Review the diff against CLAUDE.md's non-negotiables and Security.md. Flag any path where an amount reaches the ledger without a verified Razorpay capture, any secret reaching the browser, any hard-coded rupee amount or accent colour in the frontend, and any contrast below 4.5:1.

## Design pass
> Run `/impeccable polish frontend/src/pages/<Page>.tsx`. The direction contract is in .impeccable/briefs/home.md and must be preserved: near-black ground, one switchable neon accent used as light, Bricolage Grotesque display, no gradient text, no amber, no eyebrows.

## Write copy for a policy page
> Rewrite frontend/src/pages/Legal.tsx <section> in plain English for Indian founders. Keep every legal point already present (paid ad labelling, no refunds, removal rights, DPDP rights, governing law) and the placeholders for business name, address and email.

## Debug a payment
> A buyer reports paying but no rank. Given Razorpay payment id <pay_…>: check `payments` for it, then `orders` by the order id, then `webhook_events` for the event. If the capture exists in Razorpay but not in the ledger, replay the webhook or call `record_capture` with the fetched payment. Explain the gap in Issues.md.
