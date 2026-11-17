"""Resolve a URL or @handle to a listing title, description, favicon and domain."""
import ipaddress, re, socket
from urllib.parse import urlparse, urlunparse
import httpx
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; GoCrazyBot/1.0; +https://gocrazy.in)"
HANDLE_RE = re.compile(r"^@?([A-Za-z0-9_]{1,30})$")


def normalise(raw: str) -> tuple[str, str | None]:
    raw = raw.strip()
    m = HANDLE_RE.match(raw)
    if m and ("." not in raw):
        handle = m.group(1)
        return f"https://x.com/{handle}", handle
    if not re.match(r"^https?://", raw, re.I):
        raw = "https://" + raw
    p = urlparse(raw)
    # Strip query strings and fragments (outbid rule: no tracking params in listings).
    clean = urlunparse((p.scheme.lower(), p.netloc.lower(), p.path.rstrip("/") or "/", "", "", ""))
    return clean, None


def domain_of(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


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
    url, handle = normalise(raw)
    title, desc, icon, final = None, "", None, url
    if handle:
        return {"url": url, "handle": handle, "domain": "x.com", "title": f"@{handle}",
                "description": f"@{handle} on X", "favicon": f"https://unavatar.io/x/{handle}"}
    _assert_public(url)

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
