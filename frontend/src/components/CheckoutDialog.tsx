import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, X, Trophy } from 'lucide-react'
import { Button } from './Button'
import type { ClaimResult, PayResult } from '@/lib/api'
import { rupees } from '@/lib/format'

export type CheckoutState =
  | { kind: 'waiting'; claim: ClaimResult }
  | { kind: 'mock'; claim: ClaimResult }
  | { kind: 'verifying'; claim: ClaimResult }
  | { kind: 'done'; claim: ClaimResult; result: PayResult }
  | { kind: 'error'; claim: ClaimResult; message: string }

export function CheckoutDialog({ state, onClose, onMockPay }: { state: CheckoutState | null; onClose: () => void; onMockPay: (c: ClaimResult) => void }) {
  const show = state && state.kind !== 'waiting'
  return (
    <AnimatePresence>
      {show && state && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-label="Checkout">
          <motion.div initial={{ scale: 0.96, y: 8, filter: 'blur(6px)' }} animate={{ scale: 1, y: 0, filter: 'blur(0px)' }} exit={{ scale: 0.96, y: 8, filter: 'blur(6px)' }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-raised p-6 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)] hairline-strong">
            {state.kind !== 'verifying' && <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 rounded-full p-1.5 text-ink-3 hover:bg-accent-subtle hover:text-ink"><X className="size-4" /></button>}
            <div className="flex items-center gap-3">
              <img src={state.claim.listing.favicon ?? ''} alt="" className="size-10 rounded-xl bg-line-strong ring-1 ring-line-strong" />
              <div className="min-w-0"><p className="truncate font-semibold">{state.claim.listing.title}</p><p className="text-[12.5px] font-medium text-ink-3">{state.claim.listing.domain}</p></div>
            </div>

            {state.kind === 'mock' && (
              <div className="mt-5">
                <p className="text-[14px] text-ink-2"><span className="text-ink">Test mode.</span> No money is charged.</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px] font-medium">
                  <dt className="text-ink-3">Amount</dt><dd className="tnum text-right font-mono">{rupees(state.claim.amount_paise)}</dd>
                  <dt className="text-ink-3">Lands at</dt><dd className="text-right text-accent">#{state.claim.projected_rank}</dd>
                  <dt className="text-ink-3">Running total</dt><dd className="tnum text-right font-mono">{rupees(state.claim.projected_total_paise)}</dd>
                </dl>
                <Button className="mt-5 w-full" size="lg" onClick={() => onMockPay(state.claim)}>Complete test payment</Button>
              </div>
            )}
            {state.kind === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-3 py-4 text-ink-2"><Loader2 className="size-6 animate-spin text-accent" /><p className="text-[14px]">Verifying your payment…</p></div>
            )}
            {state.kind === 'done' && (
              <div className="mt-5 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-muted text-accent shadow-[var(--accent-glow)]"><Trophy className="size-6" /></div>
                <p className="display mt-4 text-2xl font-bold">You're <span className="text-accent">#{state.result.rank ?? '—'}</span> of {state.result.of}</p>
                <p className="mt-1 text-[13.5px] text-ink-2">Total paid so far: <span className="tnum font-mono text-ink">{rupees(state.result.total_paise)}</span>. Pay again any time to climb.</p>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>Back to board</Button>
                  <Link to={`/product/${state.result.slug}`} onClick={onClose} className="flex-1"><Button className="w-full">See your listing</Button></Link>
                </div>
              </div>
            )}
            {state.kind === 'error' && (
              <div className="mt-5">
                <p className="text-[14px] text-[#ff8a8a]">{state.message}</p>
                <p className="mt-2 text-[12.5px] font-medium text-ink-3">If money left your account, the Razorpay webhook will still record it within a minute. Contact us with the payment id if your rank does not appear.</p>
                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>Close</Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
