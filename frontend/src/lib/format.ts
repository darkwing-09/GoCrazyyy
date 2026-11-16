const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('en-IN')

export const rupees = (paise: number) => inr.format(Math.round(paise / 100))
export const rupeesPlain = (paise: number) => num.format(Math.round(paise / 100))
export const count = (n: number) => num.format(n)

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return ''
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = s / 60
  if (m < 60) return `${Math.floor(m)} min ago`
  const h = m / 60
  if (h < 24) return `${Math.floor(h)} h ago`
  const d = h / 24
  if (d < 30) return `${Math.floor(d)} day${d >= 2 ? 's' : ''} ago`
  const mo = d / 30
  if (mo < 12) return `${Math.floor(mo)} month${mo >= 2 ? 's' : ''} ago`
  return `${Math.floor(mo / 12)} y ago`
}

export const istDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')
