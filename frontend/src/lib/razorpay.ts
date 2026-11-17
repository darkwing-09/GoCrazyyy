declare global { interface Window { Razorpay?: new (o: object) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } } }

let loading: Promise<void> | null = null
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => res()
    s.onerror = () => rej(new Error('Could not load Razorpay checkout. Check your connection.'))
    document.head.appendChild(s)
  })
  return loading
}

export type CheckoutResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }

export async function openCheckout(o: {
  keyId: string; orderId: string; amountPaise: number; title: string; description: string; accentHex: string
  email?: string; contact?: string; onSuccess: (r: CheckoutResponse) => void; onDismiss: () => void
}) {
  await loadRazorpay()
  const rzp = new window.Razorpay!({
    key: o.keyId, order_id: o.orderId, amount: o.amountPaise, currency: 'INR',
    name: 'GoCrazy', description: o.description, image: `${location.origin}/favicon.svg`,
    prefill: { email: o.email || undefined, contact: o.contact || undefined },
    notes: { listing: o.title },
    theme: { color: o.accentHex, backdrop_color: 'rgba(9,9,11,0.85)' },
    modal: { ondismiss: o.onDismiss },
    handler: o.onSuccess,
  })
  rzp.open()
}
