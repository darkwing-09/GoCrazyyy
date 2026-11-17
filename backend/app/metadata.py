"""Resolve a URL or @handle to a listing title, description, favicon and domain.

Social profile links (Instagram, X, LinkedIn, …) resolve to the specific profile,
not the platform: pasting instagram.com/<user> lists that person's page, with their
handle as the title and a per-profile identity, so two profiles never collide and a
listing never reads as a generic "Instagram".
"""
import ipaddress, re, socket
from urllib.parse import urlparse, urlunparse
import httpx
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; GoCrazyBot/1.0; +https://gocrazy.in)"
HANDLE_RE = re.compile(r"^@?([A-Za-z0-9_.]{1,40})$")

# host -> (platform name, unavatar provider or None, handle-style "@")
SOCIAL: dict[str, tuple[str, str | None, bool]] = {
    "instagram.com": ("Instagram", "instagram", True),
    "twitter.com": ("X", "twitter", True),
    "x.com": ("X", "twitter", True),
    "tiktok.com": ("TikTok", "tiktok", True),
    "threads.net": ("Threads", None, True),
    "t.me": ("Telegram", "telegram", True),
    "youtube.com": ("YouTube", "youtube", False),
    "github.com": ("GitHub", "github", False),
    "linkedin.com": ("LinkedIn", None, False),
    "facebook.com": ("Facebook", None, False),
    "fb.com": ("Facebook", None, False),
    "pinterest.com": ("Pinterest", None, False),
    "substack.com": ("Substack", None, False),
}
# First path segments that are app pages, not a profile/page username.
_SKIP_FIRST: dict[str, set[str]] = {
    "instagram.com": {"p", "reel", "reels", "explore", "tv", "stories", "accounts", "about"},
    "youtube.com": {"watch", "results", "feed", "playlist", "shorts", "hashtag"},
    "linkedin.com": {"feed", "jobs", "learning", "posts", "pulse", "help"},
    "facebook.com": {"watch", "marketplace", "events", "groups", "gaming"},
    "twitter.com": {"home", "search", "explore", "i", "messages", "notifications"},
    "x.com": {"home", "search", "explore", "i", "messages", "notifications"},
}


def _host(netloc: str) -> str:
    h = netloc.lower()
    return h[4:] if h.startswith("www.") else h


def _social_identity(url: str) -> dict | None:
    """If `url` is a social profile/page link, build the listing from the profile itself.
    These platforms serve generic login pages to scrapers, so we never fetch them."""
    p = urlparse(url)
    host = _host(p.netloc)
    if host not in SOCIAL:
        return None
    segs = [s for s in p.path.split("/") if s]
    if not segs:
        return None  # bare platform domain: treat as a normal site
    name, provider, at = SOCIAL[host]
    first = segs[0].lower().lstrip("@")
    if first in _SKIP_FIRST.get(host, set()):
        return None
    if host == "linkedin.com" and first in ("in", "company", "school", "showcase") and len(segs) > 1:
        user = segs[1]
    elif host == "youtube.com" and first in ("c", "channel", "user") and len(segs) > 1:
        user = segs[1]
    else:
        user = segs[0]
    user = user.lstrip("@").strip()
    if not user:
        return None
    title = f"@{user}" if at else user
    favicon = (
        f"https://unavatar.io/{provider}/{user}"
        if provider
        else f"https://www.google.com/s2/favicons?domain={host}&sz=128"
    )
    return {
        "url": url,
        "handle": user,
        "domain": f"{host}/{user.lower()}",  # per-profile identity, for dedup and display
        "title": title[:200],
        "description": f"{user} on {name}",
        "favicon": favicon,
    }


def normalise(raw: str) -> tuple[str, str | None]:
    raw = raw.strip()
    m = HANDLE_RE.match(raw)
    if m and ("." not in raw):
        handle = m.group(1)
        return f"https://x.com/{handle}", handle
    if not re.match(r"^https?://", raw, re.I):
        raw = "https://" + raw
    p = urlparse(raw)
    # Strip query strings and fragments (no tracking params in listings).
    clean = urlunparse((p.scheme.lower(), p.netloc.lower(), p.path.rstrip("/") or "/", "", "", ""))
    return clean, None


def domain_of(url: str) -> str:
    return _host(urlparse(url).netloc)


def identity(raw: str) -> tuple[str, str | None]:
    """Dedup identity (domain, handle) with no network call; mirrors resolve()."""
    url, handle = normalise(raw)
    soc = _social_identity(url)
    if soc:
        return soc["domain"], soc["handle"]
    return domain_of(url), handle


class BlockedURL(ValueError):
    pass


def _assert_public(url: str) -> None:
    """Refuse URLs that point at private, loopback or link-local addresses (SSRF guard)."""
    p = urlparse(url)
    if p.scheme not in ("http", "https") or not p.hostname:
        raise BlockedURL("Only public http(s) URLs can be listed.")
    try:
        infos = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == "https" else 80))
    except socket.gaierror:
        raise BlockedURL("That domain does not resolve.")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
            raise BlockedURL("That URL is not publicly reachable.")


async def resolve(raw: str) -> dict:
    url, _ = normalise(raw)
    soc = _social_identity(url)
    if soc:
        return soc  # social profile: use the profile itself, no fetch
    _assert_public(url)
    title, desc, icon, final = None, "", None, url

    async def _guard(request: httpx.Request):
        _assert_public(str(request.url))  # every redirect hop is checked too

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=8, headers={"User-Agent": UA},
                                     event_hooks={"request": [_guard]}, max_redirects=5) as c:
            r = await c.get(url)
            final = str(r.url).split("?")[0].split("#")[0]  # resolves shorteners too
            if "text/html" in r.headers.get("content-type", ""):
                soup = BeautifulSoup(r.text[:400_000], "html.parser")
                og = lambda k: (soup.find("meta", property=k) or soup.find("meta", attrs={"name": k}))
                t = og("og:title") or og("twitter:title")
                title = (t.get("content") if t else None) or (soup.title.string.strip() if soup.title and soup.title.string else None)
                d = og("og:description") or og("description") or og("twitter:description")
                desc = (d.get("content") or "").strip() if d else ""
                link = soup.find("link", rel=lambda v: v and "icon" in v)
                if link and link.get("href"):
                    icon = httpx.URL(final).join(link["href"]).__str__()
    except BlockedURL:
        raise
    except Exception:
        pass
    dom = domain_of(final)
    return {
        "url": final, "handle": None, "domain": dom,
        "title": (title or dom)[:200], "description": desc[:600],
        "favicon": icon or f"https://www.google.com/s2/favicons?domain={dom}&sz=128",
    }
