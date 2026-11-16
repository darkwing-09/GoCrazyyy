import { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/theme'

/**
 * A perspective point field drifting toward the viewer, lit by the accent.
 * Pointer moves the camera; scroll pushes the field deeper. Pauses when hidden or reduced-motion.
 */
export function Background() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { accent, reducedMotion } = useTheme()

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: true })!
    let w = 0, h = 0, dpr = 1, raf = 0, running = true
    const N = 220
    const pts = Array.from({ length: N }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }))
    const cam = { x: 0, y: 0, tx: 0, ty: 0 }
    let scrollY = 0

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const onMove = (e: PointerEvent) => { cam.tx = (e.clientX / w - 0.5) * 2; cam.ty = (e.clientY / h - 0.5) * 2 }
    const onScroll = () => { scrollY = window.scrollY }
    const onVis = () => { running = !document.hidden; if (running) raf = requestAnimationFrame(frame) }

    const [L, C, H] = [accent.l, accent.c, accent.h]
    const col = (a: number) => `oklch(${L} ${C} ${H} / ${a})`

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h)
      cam.x += (cam.tx - cam.x) * 0.04
      cam.y += (cam.ty - cam.y) * 0.04
      const fov = Math.min(w, h) * 0.9
      const cx = w / 2 - cam.x * 40, cy = h * 0.42 - cam.y * 30 - scrollY * 0.15
      // Horizon glow
      const g = ctx.createRadialGradient(cx, cy + h * 0.1, 0, cx, cy + h * 0.1, Math.max(w, h) * 0.7)
      g.addColorStop(0, col(0.10)); g.addColorStop(0.5, col(0.025)); g.addColorStop(1, 'transparent')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      for (const p of pts) {
        if (!reducedMotion) { p.z -= dt * 0.045; if (p.z <= 0.02) { p.z = 1; p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1 } }
        const s = fov / (p.z * fov * 0.0025 + 1) / fov
        const sx = cx + (p.x - cam.x * 0.15) * w * 0.8 * (1 - p.z) * 1.3 + p.x * 20
        const sy = cy + (p.y - cam.y * 0.15) * h * 0.8 * (1 - p.z) * 1.3 + p.y * 20
        const a = (1 - p.z) * 0.9 * s
        const r = (1 - p.z) * 2.2 + 0.3
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = col(Math.min(0.85, a)); ctx.fill()
        if (p.z < 0.25) { ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, Math.PI * 2); ctx.fillStyle = col(a * 0.12); ctx.fill() }
      }
    }
    let last = performance.now()
    const frame = (t: number) => {
      if (!running) return
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      draw(dt)
      if (!reducedMotion) raf = requestAnimationFrame(frame)
    }
    resize(); raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      running = false; cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVis)
    }
  }, [accent, reducedMotion])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
}
