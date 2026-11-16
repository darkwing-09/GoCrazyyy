"""All money is integer paise. ₹1 = 100 paise."""
MIN_NEW_LISTING = 99_00        # ₹99 for a brand-new listing
TAKE_TOP_BUMP = 100_00         # current #1 + ₹100
RANK_BUMP = 10_00              # any other rank: that rank's total + ₹10
MIN_RAISE = 10_00              # raising your own listing: at least ₹10
STEP = 10_00                   # stepper increment
MAX_AMOUNT = 5_00_000_00       # ₹5,00,000 ceiling per payment (Razorpay UPI limits are lower; cards allow more)

MIN_NEW_DEAL = 49_00           # deals board is cheaper, like outbid's $10-$36 range
TAKE_TOP_BUMP_DEAL = 10_00


def price_for_rank(totals_desc: list[int], rank: int, board: str = "main") -> int:
    """Price to take `rank` (1-based) on a board whose current totals are `totals_desc`.
    Ties go to the older listing, so to *take* a rank you must strictly exceed it."""
    top_bump = TAKE_TOP_BUMP_DEAL if board == "deals" else TAKE_TOP_BUMP
    floor = MIN_NEW_DEAL if board == "deals" else MIN_NEW_LISTING
    if rank < 1:
        rank = 1
    if rank > len(totals_desc):
        return floor
    current = totals_desc[rank - 1]
    bump = top_bump if rank == 1 else RANK_BUMP
    return max(current + bump, floor)


def rank_for_amount(totals_desc: list[int], amount: int) -> int:
    """Rank a listing with `amount` would land at (ties lose to existing listings)."""
    r = 1
    for t in totals_desc:
        if t >= amount:
            r += 1
        else:
            break
    return r
