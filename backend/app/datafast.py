"""DataFast: site-level stats in, captured payments out. The API key never leaves the server."""
import time, logging
import httpx
from .config import get_settings

log = logging.getLogger("datafast")
settings = get_settings()
BASE = "https://datafa.st/api/v1"
_cache: dict[str, tuple[float, dict]] = {}


def _headers():
    return {"Authorization": f"Bearer {settings.datafast_api_key}"}


def _params():
    # dft_ account tokens need websiteId; df_ website keys infer it.
    return {"websiteId": settings.datafast_website_id} if settings.datafast_api_key.startswith("dft_") else {}


async def _get(path: str, params: dict | None = None, ttl: int | None = None) -> dict | None:
    if not settings.datafast_api_key:
        return None
    key = path + str(params)
    ttl = ttl or settings.stats_cache_seconds
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    try:
        async with httpx.AsyncClient(timeout=6) as c:
            r = await c.get(f"{BASE}{path}", headers=_headers(), params={**_params(), **(params or {})})
            r.raise_for_status()
            data = (r.json().get("data") or [{}])[0]
            _cache[key] = (time.time(), data)
            return data
    except Exception as e:  # stats are decorative; never break the page over them
        log.warning("datafast %s failed: %s", path, e)
        return hit[1] if hit else None


async def realtime_visitors() -> int | None:
    d = await _get("/analytics/realtime", {"fields": "visitors"}, ttl=30)
    return None if d is None else int(d.get("visitors", 0))


async def overview(start: str | None = None, end: str | None = None, tz: str = "Asia/Kolkata") -> dict | None:
    p = {"timezone": tz, "fields": "visitors,pageviews,revenue,payments,currency"}
    if start and end:
        p.update(startAt=start, endAt=end)
    return await _get("/analytics/overview", p)


async def post_payment(*, amount_paise: int, transaction_id: str, visitor_id: str | None,
                       email: str | None, renewal: bool) -> bool:
    """Idempotent on transaction_id (DataFast returns a duplicate message on retries)."""
    if not settings.datafast_api_key:
        return False
    body = {"amount": round(amount_paise / 100, 2), "currency": "INR", "transaction_id": transaction_id,
            "renewal": renewal}
    if visitor_id:
        body["datafast_visitor_id"] = visitor_id
    if email:
        body["email"] = email
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.post(f"{BASE}/payments", headers=_headers(), params=_params(), json=body)
            r.raise_for_status()
            return True
    except Exception as e:
        log.warning("datafast payment post failed for %s: %s", transaction_id, e)
        return False
