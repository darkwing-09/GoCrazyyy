/**
 * The DataFast tracking script is loaded statically from index.html (cookieless build).
 * Only the public website id reaches the browser; the server-side API key never does.
 */

/** Visitor id the tracking script sets, attached to the Razorpay order so revenue is attributed.
 *  In cookieless mode this cookie is usually absent, so attribution falls back to null. */
export function dataFastVisitorId(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)datafast_visitor_id=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
