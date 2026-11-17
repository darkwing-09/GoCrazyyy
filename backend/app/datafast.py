"""DataFast: site-level stats in, captured payments out. The API key never leaves the server.

Works with either key type:
- `df_…` website key: scoped to one website; no websiteId needed.
- `dft_…` account token: every analytics call needs the website's internal id. If
  DATAFAST_WEBSITE_ID is empty or is the public `dfid_…` tracking id, the internal id is
  looked up once from /admin/websites (matched by tracking id, then domain) and cached.
"""
import asyncio, time, logging
import httpx
from .config import get_settings

log = logging.getLogger("datafast")
settings = get_settings()
BASE = "https://datafa.st/api/v1"
TZ = "Asia/Kolkata"
_cache: dict[str, tuple[float, object]] = {}
_resolved_site_id: str | None = None


def enabled() -> bool:
    return bool(settings.datafast_api_key)


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.datafast_api_key}"}


async def _site_id(c: httpx.AsyncClient) -> str | None:
    """Internal website id for dft_ account tokens (None for df_ website keys)."""
    global _resolved_site_id
    if not settings.datafast_api_key.startswith("dft_"):
        return None
    configured = settings.datafast_website_id.strip()
    if configured and not configured.startswith("dfid_"):
        return configured
    if _resolved_site_id:
        return _resolved_site_id
    r = await c.get(f"{BASE}/admin/websites", headers=_headers())
    r.raise_for_status()
    sites = r.json().get("data") or []
    domain = settings.datafast_domain.strip().lower()
    match = (next((s for s in sites if configured and s.get("trackingId") == configured), None)
             or next((s for s in sites if domain and (s.get("domain") or "").lower() == domain), None)
             or (sites[0] if len(sites) == 1 else None))
    if not match:
        raise RuntimeError("DataFast website not found; set DATAFAST_WEBSITE_ID or DATAFAST_DOMAIN")
    _resolved_site_id = match["_id"]
    return _resolved_site_id


async def _get(path: str, params: dict | None = None, ttl: int | None = None, rows: bool = False):
    """GET an analytics endpoint. Returns data[0] (or the full data list when rows=True).
    Cached per path+params; on any failure the last good value is served, else None."""
    if not enabled():
        return None
    key = path + repr(sorted((params or {}).items())) + str(rows)
    ttl = ttl or settings.stats_cache_seconds
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    try:
        async with httpx.AsyncClient(timeout=6) as c:
            q = dict(params or {})
            sid = await _site_id(c)
            if sid:
                q["websiteId"] = sid
            r = await c.get(f"{BASE}{path}", headers=_headers(), params=q)
            r.raise_for_status()
            data = r.json().get("data") or []
            value = data if rows else (data[0] if data else {})
            _cache[key] = (time.time(), value)
            return value
    except Exception as e:  # stats are decorative; never break the page over them
        log.warning("datafast %s failed: %s", path, e)
        return hit[1] if hit else None


async def realtime_visitors() -> int | None:
    d = await _get("/analytics/realtime", {"fields": "visitors"}, ttl=30)
    return None if d is None else int(d.get("visitors") or 0)


async def overview(start: str | None = None, end: str | None = None) -> dict | None:
    p = {"timezone": TZ, "fields": "visitors,pageviews,sessions,bounce_rate,avg_session_duration"}
    if start and end:
        p.update(startAt=start, endAt=end)
    return await _get("/analytics/overview", p)


async def top(kind: str, limit: int = 5) -> list[dict] | None:
    """Breakdown rows (countries, referrers, pages, devices…) as [{name, visitors}]."""
    data = await _get(f"/analytics/{kind}", {"timezone": TZ, "limit": limit}, ttl=300, rows=True)
    if data is None:
        return None
    out = []
    for row in data:
        name = next((v for k, v in row.items() if isinstance(v, str) and v and k not in ("currency",)), None)
        if name:
            out.append({"name": name, "visitors": int(row.get("visitors") or 0)})
    return out


async def snapshot(today: str) -> dict | None:
    """Everything the site shows, fetched in parallel."""
    if not enabled():
        return None
    online, today_ov, all_ov, countries, sources = await asyncio.gather(
        realtime_visitors(), overview(today, today), overview(), top("countries"), top("referrers"))
    if all_ov is None:
        return None
    return {"online": online, "today": today_ov or {}, "all": all_ov,
            "countries": countries or [], "sources": sources or []}


async def post_payment(*, amount_paise: int, transaction_id: str, visitor_id: str | None,
                       email: str | None, renewal: bool) -> bool:
    """Idempotent on transaction_id (DataFast returns a duplicate message on retries)."""
    if not enabled():
        return False
    body = {"amount": round(amount_paise / 100, 2), "currency": "INR", "transaction_id": transaction_id,
            "renewal": renewal}
    if visitor_id:
        body["datafast_visitor_id"] = visitor_id
    if email:
        body["email"] = email
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            sid = await _site_id(c)
            r = await c.post(f"{BASE}/payments", headers=_headers(),
                             params={"websiteId": sid} if sid else None, json=body)
            r.raise_for_status()
            return True
    except Exception as e:
        log.warning("datafast payment post failed for %s: %s", transaction_id, e)
        return False
