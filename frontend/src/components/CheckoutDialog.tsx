import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, X, Trophy, Smartphone, ExternalLink, QrCode, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from './Button'
import { api, type ClaimResult, type PayResult } from '@/lib/api'
import { rupees } from '@/lib/format'

export type CheckoutState =
  | { kind: 'waiting'; claim: ClaimResult }
  | { kind: 'upi'; claim: ClaimResult }
  | { kind: 'mock'; claim: ClaimResult }
  | { kind: 'verifying'; claim: ClaimResult }
  | { kind: 'done'; claim: ClaimResult; result: PayResult }
  | { kind: 'error'; claim: ClaimResult; message: string }

export function CheckoutDialog({
  state,
  onClose,
  onMockPay,
  onUpiPaid,
}: {
  state: CheckoutState | null
  onClose: () => void
  onMockPay: (c: ClaimResult) => void
  onUpiPaid?: (r: PayResult, c: ClaimResult) => void
}) {
  const show = state && state.kind !== 'waiting'
  const [checking, setChecking] = useState(false)
  const [checkMsg, setCheckMsg] = useState<string | null>(null)

  // Auto-poll UPI order status while on the UPI QR screen
  useEffect(() => {
    if (state?.kind !== 'upi') return
    let active = true
    const claim = state.claim

    const poll = async () => {
      try {
        const res = await api.checkStatus(claim.order_id)
        if (active && res.paid && onUpiPaid) {
          onUpiPaid(res, claim)
        }
      } catch {
        // Continue polling on transient errors
      }
    }

    const timer = setInterval(poll, 2500)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [state, onUpiPaid])

  const handleManualCheck = async (claim: ClaimResult) => {
    setChecking(true)
    setCheckMsg(null)
    try {
      const res = await api.checkStatus(claim.order_id)
      if (res.paid && onUpiPaid) {
        onUpiPaid(res, claim)
      } else {
        setCheckMsg('Payment pending. If you just paid, please wait a moment while the bank confirms.')
      }
    } catch {
      setCheckMsg('Could not reach gateway status. Will keep auto-checking.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <AnimatePresence>
      {show && state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal
          aria-label="Checkout"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, filter: 'blur(6px)' }}
            animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ scale: 0.95, y: 10, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-raised p-6 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.95)] hairline-strong max-h-[90vh] overflow-y-auto"
          >
            {state.kind !== 'verifying' && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 rounded-full p-1.5 text-ink-3 hover:bg-accent-subtle hover:text-ink transition"
              >
                <X className="size-4" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <img
                src={state.claim.listing.favicon ?? ''}
                alt=""
                className="size-10 rounded-xl bg-line-strong ring-1 ring-line-strong object-contain p-1"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{state.claim.listing.title}</p>
                <p className="text-[12.5px] font-medium text-ink-3">{state.claim.listing.domain}</p>
              </div>
            </div>

            {state.kind === 'upi' && (
              <div className="mt-5">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-wider text-accent flex items-center gap-1.5">
                      <QrCode className="size-3.5" /> Direct UPI Payment
                    </span>
                    <p className="text-[18px] font-bold text-ink tnum mt-0.5">
                      {rupees(state.claim.amount_paise)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11.5px] text-ink-3">Lands at</span>
                    <p className="text-[17px] font-bold text-accent">#{state.claim.projected_rank}</p>
                  </div>
                </div>

                {/* Dynamic QR Code display */}
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-black/40 border border-line p-4">
                  <div className="rounded-xl bg-white p-2.5 shadow-md">
                    <QRCodeSVG
                      value={state.claim.upi_intent || state.claim.payment_url || ''}
                      size={170}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-3 text-center text-[12px] font-medium text-ink-2">
                    Scan with <span className="text-ink font-semibold">GPay, PhonePe, Paytm, BHIM, Cred</span>
                  </p>
                </div>

                {/* Mobile direct UPI Intent button */}
                {state.claim.upi_intent && (
                  <a
                    href={state.claim.upi_intent}
                    className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent font-semibold text-black transition hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_var(--accent-glow-subtle)]"
                  >
                    <Smartphone className="size-4.5" />
                    <span>Pay via any UPI App</span>
                  </a>
                )}

                {/* Hosted payment page link */}
                {state.claim.payment_url && (
                  <a
                    href={state.claim.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 text-[12.5px] font-medium text-accent hover:underline"
                  >
                    <span>Open Gateway Payment Page</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                )}

                {/* Live auto-detection status */}
                <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-surface/50 border border-line/60 p-3 text-center">
                  <div className="flex items-center gap-2 text-[12.5px] text-ink-2">
                    <Loader2 className="size-3.5 animate-spin text-accent" />
                    <span>Awaiting payment (auto-confirms instantly)…</span>
                  </div>
                  {checkMsg && <p className="text-[11.5px] text-accent/90">{checkMsg}</p>}
                  <button
                    onClick={() => handleManualCheck(state.claim)}
                    disabled={checking}
                    className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-ink-3 hover:text-ink transition underline cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3 ${checking ? 'animate-spin' : ''}`} />
                    <span>I've completed the payment, check status</span>
                  </button>
                </div>
              </div>
            )}

            {state.kind === 'mock' && (
              <div className="mt-5">
                <p className="text-[14px] text-ink-2">
                  <span className="text-ink font-semibold">Test mode.</span> No money is charged.
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px] font-medium">
                  <dt className="text-ink-3">Amount</dt>
                  <dd className="tnum text-right font-mono">{rupees(state.claim.amount_paise)}</dd>
                  <dt className="text-ink-3">Lands at</dt>
                  <dd className="text-right text-accent">#{state.claim.projected_rank}</dd>
                  <dt className="text-ink-3">Running total</dt>
                  <dd className="tnum text-right font-mono">{rupees(state.claim.projected_total_paise)}</dd>
                </dl>
                <Button className="mt-5 w-full" size="lg" onClick={() => onMockPay(state.claim)}>
                  Complete test payment
                </Button>
              </div>
            )}

            {state.kind === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-3 py-6 text-ink-2">
                <Loader2 className="size-7 animate-spin text-accent" />
                <p className="text-[14px] font-medium">Verifying your payment…</p>
              </div>
            )}

            {state.kind === 'done' && (
              <div className="mt-5 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-muted text-accent shadow-[var(--accent-glow)]">
                  <Trophy className="size-6" />
                </div>
                <p className="display mt-4 text-2xl font-bold">
                  Your ad is live at <span className="text-accent">#{state.result.rank ?? '—'}</span> of {state.result.of}
                </p>
                <p className="mt-1 text-[13.5px] text-ink-2">
                  Ad spend so far: <span className="tnum font-mono text-ink">{rupees(state.result.total_paise)}</span>. Advertise again any time to rank higher.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Back to board
                  </Button>
                  <Link to={`/product/${state.result.slug}`} onClick={onClose} className="flex-1">
                    <Button className="w-full">See your listing</Button>
                  </Link>
                </div>
              </div>
            )}

            {state.kind === 'error' && (
              <div className="mt-5">
                <p className="text-[14px] text-[#ff8a8a]">{state.message}</p>
                <p className="mt-2 text-[12.5px] font-medium text-ink-3">
                  If money left your account, the gateway webhook will record it shortly. Contact support if your rank does not appear.
                </p>
                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
