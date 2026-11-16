import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Accent = { id: string; name: string; h: number; c: number; l: number; hex: string }
export const ACCENTS: Accent[] = [
  { id: 'mint', name: 'Mint', h: 160, c: 0.19, l: 0.87, hex: '#5cf2b0' },
  { id: 'cyan', name: 'Cyan', h: 215, c: 0.15, l: 0.85, hex: '#5fd8ff' },
  { id: 'violet', name: 'Violet', h: 300, c: 0.2, l: 0.74, hex: '#b78bff' },
  { id: 'magenta', name: 'Magenta', h: 350, c: 0.22, l: 0.74, hex: '#ff6fb3' },
  { id: 'lime', name: 'Lime', h: 125, c: 0.22, l: 0.9, hex: '#c6f55a' },
  { id: 'ember', name: 'Ember', h: 35, c: 0.19, l: 0.8, hex: '#ffac5f' },
]

type Ctx = { accent: Accent; setAccent: (id: string) => void; reducedMotion: boolean }
const ThemeCtx = createContext<Ctx>({ accent: ACCENTS[0], setAccent: () => {}, reducedMotion: false })

function readStored(): string {
  try { return localStorage.getItem('gc-accent') ?? 'mint' } catch { return 'mint' }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(readStored)
  const [reducedMotion, setRM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  const accent = useMemo(() => ACCENTS.find(a => a.id === id) ?? ACCENTS[0], [id])

  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--accent-h', String(accent.h))
    r.setProperty('--accent-c', String(accent.c))
    r.setProperty('--accent-l', String(accent.l))
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#09090b')
    try { localStorage.setItem('gc-accent', accent.id) } catch { /* private mode */ }
  }, [accent])

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setRM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const value = useMemo(() => ({ accent, setAccent: setId, reducedMotion }), [accent, reducedMotion])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
