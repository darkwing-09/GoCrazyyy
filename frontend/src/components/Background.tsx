import { useEffect, useRef, useState } from 'react'
import type { TubesApp } from 'threejs-components/build/cursors/tubes1.min.js'
import { useTheme } from '@/lib/theme'

/**
 * Hero-scoped 3D neon tubes that follow the cursor (threejs-components "tubes1", by Kevin Levron).
 *
 * Adapted for GoCrazy:
 * - Colours are multi-colour: each palette spreads three vivid, far-apart hues across the tubes and lights the
 *   metallic tubes with four more, on the near-black page (the first is the original demo's pink/green/purple).
 * - Clicking empty space in the first viewport cycles through curated palettes (the original randomised).
 * - Idle (no cursor over the hero): tubes trace a wide infinity symbol (a 1:2 Lissajous path, x = cos t,
 *   y = sin 2t), each one a short comet covering about a fifth of the loop. When the cursor returns they ease to
 *   the library's original cursor-follow length.
 * - It lives in the first viewport only and fades out downward, so the leaderboard rows stay clean and readable.
 * - The library pauses rendering itself when scrolled out of view or when the tab is hidden.
 * - Reduced motion, no WebGL, or a failed load all fall back to a static accent glow.
 */
type Palette = { tubes: string[]; lights: string[] }

const PALETTES: Palette[] = [
  // The original demo: magenta, green, violet, lit with lime, orange, hot pink and sky.
  { tubes: ['#f967fb', '#53bc28', '#6958d5'], lights: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'] },
  // Brand sky blue with pink and amber, lit with violet, coral and cyan.
  { tubes: ['#38bdf8', '#f472b6', '#facc15'], lights: ['#38bdf8', '#c084fc', '#ff5f8f', '#ffd166'] },
  // Aurora: mint, violet, rose, lit with cyan, orchid, lime and indigo.
  { tubes: ['#22e3b4', '#8b5cf6', '#ff4d6d'], lights: ['#00e5ff', '#ff6ec7', '#b4ff39', '#7c4dff'] },
  // Synthwave: orange, hot pink, electric blue, lit with gold, aqua, red and purple.
  { tubes: ['#ff7a1a', '#ff2e97', '#4f7cff'], lights: ['#ffd23f', '#00f0ff', '#ff3864', '#9d4edd'] },
]

/**
 * Trail shape. Each tube is a chain of points; every frame each point moves a fraction of the way toward the
 * point ahead of it (already moved this frame). With fraction f = dt / (lag + dt), every point trails the one
 * ahead by `lag` seconds at any frame rate, so a tube spans about POINTS × lag seconds of path. Tube length is
 * set mostly by the number of points (fewer points is also less GPU work); a long per-point lag would smooth the
 * motion away and curl the tail into the centre instead of tracing the loop. Simulated at 20/60/120 fps with
 * 120 points: the idle tube spans ~20% of the ∞ loop (~545 px of a ~2,760 px loop at 1440 px wide, within a few
 * px of the path); following, it spans ~1.3 s of path, the library default (~330 px behind a cursor moving at
 * 250 px/s). Touch devices use ~70% of the points, so their tubes are proportionally shorter and lighter.
 */
const SEGMENTS = { min: 105, max: 135 }
const SEGMENTS_TOUCH = { min: 74, max: 94 }
const LAG_IDLE = 0.0091 // seconds per point → ~1.1 s of path per tube, ~20% of the loop
const LAG_FOLLOW = 0.011 // seconds per point → ~1.3 s, the library's original cursor-follow length

/** Idle path speeds. Must stay in a 1:2 ratio for the path to be an infinity symbol (x = cos t, y = sin 2t). */
const IDLE_SPEED_X = 0.9
const IDLE_SPEED_Y = IDLE_SPEED_X * 2

/** Per-frame follow fraction for a per-point lag in seconds. Never reaches 1, so tubes cannot collapse. */
const followFactor = (delta: number, lag: number) => {
  const dt = Math.min(0.1, Math.max(1 / 240, delta))
  return dt / (lag + dt)
}

/** Infinity loop size in CSS pixels, scaled to the viewport. */
function idleRadii(width: number) {
  const rx = Math.min(width * 0.34, 520)
  return { rx, ry: rx * 0.42 }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Clicks on links, buttons, form controls and dialogs keep their own meaning. */
function isInteractive(el: EventTarget | null): boolean {
  return el instanceof Element && !!el.closest('a, button, input, select, textarea, label, [role="dialog"], [role="tab"], summary')
}

export function Background() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<TubesApp | null>(null)
  const paletteIdx = useRef(0)
  /** True while the pointer is over the first viewport, i.e. while the library is following it. */
  const following = useRef(false)
  const { reducedMotion } = useTheme()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (reducedMotion || !hasWebGL()) return
    let disposed = false
    const canvas = canvasRef.current!
    const coarse = matchMedia('(pointer: coarse)').matches

    import('threejs-components/build/cursors/tubes1.min.js')
      .then(({ default: TubesCursor }) => {
        if (disposed) return
        const p = PALETTES[paletteIdx.current]
        const { rx, ry } = idleRadii(window.innerWidth)
        const app = TubesCursor(canvas, {
          bloom: { threshold: 0, strength: 1.1, radius: 0.5 },
          tubes: {
            count: coarse ? 10 : 16,
            colors: p.tubes,
            lights: { intensity: 180, colors: p.lights },
            // Points per tube set the trail length (see SEGMENTS).
            minTubularSegments: (coarse ? SEGMENTS_TOUCH : SEGMENTS).min,
            maxTubularSegments: (coarse ? SEGMENTS_TOUCH : SEGMENTS).max,
            lerp: followFactor(1 / 60, LAG_IDLE),
          },
          sleepRadiusX: rx,
          sleepRadiusY: ry,
          sleepTimeScale1: IDLE_SPEED_X,
          sleepTimeScale2: IDLE_SPEED_Y,
        })

        // Ease the trail between the idle comet and the cursor-follow length, frame-rate independent.
        let lag = LAG_IDLE
        const render = app.three.onBeforeRender
        app.three.onBeforeRender = (time) => {
          const target = following.current ? LAG_FOLLOW : LAG_IDLE
          lag += (target - lag) * Math.min(1, time.delta * 2.5)
          app.tubes.options.lerp = followFactor(time.delta, lag)
          render(time)
        }
        // The library defaults to a 2x pixel ratio; bloom hides the difference and this halves GPU work.
        app.three.minPixelRatio = 1
        app.three.maxPixelRatio = Math.min(1.5, window.devicePixelRatio || 1)
        app.three.resize()
        appRef.current = app
        setReady(true)
      })
      .catch(() => {
        /* the static glow stays visible */
      })

    return () => {
      disposed = true
      appRef.current?.dispose()
      appRef.current = null
      setReady(false)
    }
  }, [reducedMotion])

  // Track whether the cursor is over the hero (mirrors the library's own hover test) and keep the
  // infinity loop sized to the viewport.
  useEffect(() => {
    if (!ready) return
    const wrap = wrapRef.current!
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = wrap.getBoundingClientRect()
      following.current = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }
    const idle = () => { following.current = false }
    const onResize = () => {
      const app = appRef.current
      if (!app) return
      const { rx, ry } = idleRadii(window.innerWidth)
      app.options.sleepRadiusX = rx
      app.options.sleepRadiusY = ry
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', idle)
    window.addEventListener('blur', idle)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', idle)
      window.removeEventListener('blur', idle)
      window.removeEventListener('resize', onResize)
    }
  }, [ready])

  // Click on empty space in the first viewport cycles the palettes.
  useEffect(() => {
    if (!ready) return
    const onClick = (e: MouseEvent) => {
      const app = appRef.current
      const wrap = wrapRef.current
      if (!app || !wrap || isInteractive(e.target) || e.pageY > wrap.offsetHeight) return
      paletteIdx.current = (paletteIdx.current + 1) % PALETTES.length
      const p = PALETTES[paletteIdx.current]
      app.tubes.setColors(p.tubes)
      app.tubes.setLightsColors(p.lights)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [ready])

  const fade = 'linear-gradient(to bottom, #000 55%, transparent 100%)'
  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] min-h-[560px] overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      {/* Static glow: the fallback, and the ground the tubes fade into. */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 55% at 50% 30%, var(--accent-muted), transparent 70%)' }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: ready ? 0.85 : 0, touchAction: 'none' }}
      />
      {/* Keeps the headline and form legible over the brightest tubes. */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(48% 34% at 50% 34%, color-mix(in srgb, var(--bg) 62%, transparent), transparent 100%)' }} />
    </div>
  )
}
