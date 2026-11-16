/** DataFast tracking script. The website id is public; the API key never reaches the browser. */
export function installDataFast(websiteId: string | null, domain: string | null) {
  if (!websiteId || document.getElementById('datafast-script')) return
  const s = document.createElement('script')
  s.id = 'datafast-script'
  s.defer = true
  s.src = 'https://datafa.st/js/script.js'
  s.dataset.websiteId = websiteId
  if (domain) s.dataset.domain = domain
  document.head.appendChild(s)
}

/** Visitor id the tracking script sets, attached to the Razorpay order so revenue is attributed. */
export function dataFastVisitorId(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)datafast_visitor_id=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
