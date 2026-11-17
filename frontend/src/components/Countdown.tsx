import { useEffect, useState } from 'react'
import { pad2 } from '@/lib/format'

export function Countdown({ to, label }: { to: string; label?: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const s = Math.max(0, (new Date(to).getTime() - now) / 1000)
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  const Cell = ({ v, u }: { v: number; u: string }) => (
    <span className="tnum inline-flex items-baseline gap-0.5 rounded-md bg-line-strong px-1.5 py-0.5 font-mono text-[12px] font-medium text-ink"><span>{pad2(v)}</span><span className="text-[10px] text-ink-2">{u}</span></span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-ink-3" aria-live="off">
      {label && <span className="mr-1 text-[12px] font-medium">{label}</span>}
      {d > 0 && <><Cell v={d} u="d" /><span>:</span></>}
      <Cell v={h} u="h" /><span>:</span><Cell v={m} u="m" /><span>:</span><Cell v={sec} u="s" />
    </span>
  )
}
