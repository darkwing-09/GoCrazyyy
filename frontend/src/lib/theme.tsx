import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** GoCrazy has one theme: dark, with the sky-blue accent. */
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

type ThemeContextType = { accent: ThemeAccent; reducedMotion: boolean }

const ThemeContext = createContext<ThemeContextType>({ accent: THEME_COLOR, reducedMotion: false })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setRM] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light')
    root.classList.add('dark')
    try {
      // Clear the preference left by the old light/dark toggle.
      localStorage.removeItem('gc-mode')
      localStorage.removeItem('gc-accent')
    } catch {
      /* private mode */
    }
  }, [])

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setRM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const value = useMemo(() => ({ accent: THEME_COLOR, reducedMotion }), [reducedMotion])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
