import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Mode = 'dark' | 'light'

export type ThemeAccent = {
  id: string
  name: string
  hex: string
  hoverHex: string
  activeHex: string
  ink: string
  glow: string
  glowSubtle: string
  subtle: string
  muted: string
}

// Single Dedicated Color Theme: #38bdf8 (Cyber Sky Blue)
export const THEME_COLOR: ThemeAccent = {
  id: 'cyber-sky',
  name: 'Cyber Sky',
  hex: '#38bdf8',
  hoverHex: '#7dd3fc',
  activeHex: '#0284c7',
  ink: '#041419',
  glow: 'rgba(56, 189, 248, 0.55)',
  glowSubtle: 'rgba(56, 189, 248, 0.15)',
  subtle: 'rgba(56, 189, 248, 0.08)',
  muted: 'rgba(56, 189, 248, 0.18)',
}

type ThemeContextType = {
  mode: Mode
  setMode: (m: Mode) => void
  accent: ThemeAccent
  reducedMotion: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  setMode: () => {},
  accent: THEME_COLOR,
  reducedMotion: false,
})

function readStoredMode(): Mode {
  try {
    return (localStorage.getItem('gc-mode') as Mode) ?? 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeRaw] = useState<Mode>(readStoredMode)
  const [reducedMotion, setRM] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Dedicated #38bdf8 Cyber Sky theme everywhere
  const accent: ThemeAccent = useMemo(() => {
    const isDark = mode === 'dark'
    return {
      id: 'cyber-sky',
      name: 'Cyber Sky (#38bdf8)',
      hex: '#38bdf8',
      hoverHex: '#7dd3fc',
      activeHex: '#0284c7',
      ink: '#041419',
      glow: isDark ? 'rgba(56, 189, 248, 0.55)' : 'rgba(56, 189, 248, 0.35)',
      glowSubtle: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.12)',
      subtle: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.08)',
      muted: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(56, 189, 248, 0.16)',
    }
  }, [mode])

  const setMode = (m: Mode) => setModeRaw(m)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(mode)
    root.setAttribute('data-theme', mode)

    const r = root.style
    r.setProperty('--accent', accent.hex)
    r.setProperty('--accent-hover', accent.hoverHex)
    r.setProperty('--accent-active', accent.activeHex)
    r.setProperty('--accent-ink', accent.ink)
    r.setProperty('--accent-glow', `0 8px 36px -4px ${accent.glow}`)
    r.setProperty('--accent-glow-subtle', `0 0 24px ${accent.glowSubtle}`)
    r.setProperty('--accent-subtle', accent.subtle)
    r.setProperty('--accent-muted', accent.muted)

    // Legacy variables
    r.setProperty('--accent-12', accent.subtle)
    r.setProperty('--accent-20', accent.muted)
    r.setProperty('--accent-40', accent.glowSubtle)

    document.querySelector('meta[name=theme-color]')?.setAttribute('content', mode === 'dark' ? '#07070a' : '#f8fafc')

    try {
      localStorage.setItem('gc-mode', mode)
      localStorage.setItem('gc-accent', '#38bdf8')
    } catch {
      /* private mode */
    }
  }, [mode, accent])

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setRM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      accent,
      reducedMotion,
    }),
    [mode, accent, reducedMotion]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
