from app import pricing as p


def test_new_listing_floor():
    assert p.price_for_rank([], 1) == p.MIN_NEW_LISTING
    assert p.price_for_rank([50_000], 5) == p.MIN_NEW_LISTING  # beyond the board: floor


def test_take_top_is_current_plus_100():
    assert p.price_for_rank([1_000_00, 500_00], 1) == 1_000_00 + p.TAKE_TOP_BUMP


def test_other_rank_is_current_plus_10():
    assert p.price_for_rank([1_000_00, 500_00], 2) == 500_00 + p.RANK_BUMP


def test_rank_for_amount_ties_lose():
    totals = [600_00, 300_00, 300_00, 100_00]
    assert p.rank_for_amount(totals, 700_00) == 1
    assert p.rank_for_amount(totals, 300_00) == 4   # tie goes to older listings
    assert p.rank_for_amount(totals, 301_00) == 2
    assert p.rank_for_amount(totals, 50_00) == 5


def test_deals_board_cheaper():
    assert p.price_for_rank([], 1, "deals") == p.MIN_NEW_DEAL
    assert p.price_for_rank([100_00], 1, "deals") == 100_00 + p.TAKE_TOP_BUMP_DEAL
