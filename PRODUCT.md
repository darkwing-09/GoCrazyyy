# GoCrazy

Pay-to-rank leaderboard for Indian startups. A founder submits a URL (or @handle), picks a category and pays in rupees via Razorpay. Rank is the cumulative total of captured payments per listing (₹100 + ₹200 + ₹300 counts as ₹600). Boards: All-time, Today (resets at midnight IST), Daily archive, per-category, and a themed Deals board.

## Audience
Indian early-stage founders and indie makers buying distribution for ₹99 to a few thousand rupees. They arrive from X/LinkedIn/WhatsApp groups, on laptops and phones, usually at night.

## Truths
- Money is stored as integer paise, shown as ₹ in en-IN format.
- New listing minimum ₹99. Taking #1 costs the current #1 total plus ₹100. Any other rank costs that rank's total plus ₹10. Raising an existing listing charges only the difference (min ₹10). Ties go to the older listing.
- Rank is assigned only when Razorpay confirms capture (signature-verified, idempotent webhook).
- Site-level stats (online now, visitors today, revenue) come from DataFast; clicks and totals come from our DB.
- Placements are paid advertisements and are labelled as such. No refunds.

## Brand commitments (pinned by the user)
- Near-black ground, one restrained neon accent that the visitor can switch (palette picker), light-based motion (glow, blur, beams) rather than bouncy transforms. No navy, no amber, no gradient text, no glass-as-decoration.
- Reference craft bar: Aceternity UI, Skiper UI, animmasterlib. outbid.lol is the functional reference, not the visual one.

## Assumptions (no interview was possible in this session)
- Niche left open; copy addresses "Indian startups" broadly.
- GST is treated as inclusive in the displayed price; confirm with a CA.
