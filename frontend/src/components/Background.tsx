import { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/theme'

/**
 * Interactive 3D Animated Background
 * Combines:
 * - 3D Perspective Cyber Grid (Animmaster / Aceternity style)
 * - Interactive 3D particle constellation reacting to mouse inertia & scroll
 * - Dynamic Aurora Glow following cursor coordinates with the selected neon accent
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { accent, mode, reducedMotion } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = true

    // 3D Particles
    const PARTICLE_COUNT = 180
    type Particle = {
      x: number
      y: number
      z: number
      vx: number
      vy: number
      size: number
      baseAlpha: number
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() * 2 - 1) * 1.5,
      y: (Math.random() * 2 - 1) * 1.5,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.6 + 0.3,
    }))

    // Camera with inertia
    const cam = { x: 0, y: 0, targetX: 0, targetY: 0 }
    let scrollY = window.scrollY
    let gridOffset = 0

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointerMove = (e: PointerEvent) => {
      // Normalize to -1 ... 1
      cam.targetX = (e.clientX / width - 0.5) * 2
      cam.targetY = (e.clientY / height - 0.5) * 2
    }

    const onScroll = () => {
      scrollY = window.scrollY
    }

    const onVisibilityChange = () => {
      running = !document.hidden
      if (running) rafId = requestAnimationFrame(render)
    }

    // Color helpers based on the selected neon accent
    const isDark = mode === 'dark'

    const render = (time: number) => {
      if (!running) return

      ctx.clearRect(0, 0, width, height)

      // Smooth camera interpolation
      cam.x += (cam.targetX - cam.x) * 0.04
      cam.y += (cam.targetY - cam.y) * 0.04

      const horizonY = height * 0.52 - cam.y * 30 - scrollY * 0.08
      const centerX = width * 0.5 - cam.x * 45

      // ─── 1. AMBIENT AURORA GLOW ───
      const auroraRadius = Math.max(width, height) * 0.65
      const auroraX = centerX + Math.sin(time * 0.0008) * 80
      const auroraY = horizonY - 40 + Math.cos(time * 0.0006) * 40

      const aurora = ctx.createRadialGradient(auroraX, auroraY, 0, auroraX, auroraY, auroraRadius)
      if (isDark) {
        aurora.addColorStop(0, accent.subtle.replace('0.08', '0.18'))
        aurora.addColorStop(0.35, accent.subtle.replace('0.08', '0.06'))
        aurora.addColorStop(0.7, 'rgba(8, 8, 12, 0.02)')
        aurora.addColorStop(1, 'transparent')
      } else {
        aurora.addColorStop(0, accent.subtle.replace('0.08', '0.12'))
        aurora.addColorStop(0.4, accent.subtle.replace('0.08', '0.03'))
        aurora.addColorStop(1, 'transparent')
      }
      ctx.fillStyle = aurora
      ctx.fillRect(0, 0, width, height)

      // Secondary floating accent orb that tracks cursor
      const cursorOrbX = width * 0.5 + cam.x * (width * 0.3)
      const cursorOrbY = height * 0.35 + cam.y * (height * 0.25)
      const cursorOrb = ctx.createRadialGradient(cursorOrbX, cursorOrbY, 0, cursorOrbX, cursorOrbY, 260)
      cursorOrb.addColorStop(0, accent.glowSubtle)
      cursorOrb.addColorStop(1, 'transparent')
      ctx.fillStyle = cursorOrb
      ctx.fillRect(0, 0, width, height)

      // ─── 2. 3D PERSPECTIVE HORIZON GRID ───
      if (!reducedMotion) {
        gridOffset = (gridOffset + 0.35) % 40
      }

      ctx.save()
      ctx.beginPath()
      // Mask to bottom half for clean horizon
      ctx.rect(0, horizonY - 10, width, height - horizonY + 10)
      ctx.clip()

      const gridLines = 24
      const gridSpread = width * 1.8
      const vanishingX = centerX
      const vanishingY = horizonY

      // Perspective vertical rays radiating from vanishing point
      for (let i = -gridLines / 2; i <= gridLines / 2; i++) {
        const bottomX = centerX + (i / (gridLines / 2)) * (gridSpread / 2)
        const alpha = Math.max(0, 1 - Math.abs(i) / (gridLines / 2)) * (isDark ? 0.07 : 0.05)

        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(30, 41, 59, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(vanishingX, vanishingY)
        ctx.lineTo(bottomX, height + 80)
        ctx.stroke()
      }

      // Horizontal depth lines with geometric perspective compression
      const depthSteps = 14
      for (let j = 0; j < depthSteps; j++) {
        const p = Math.pow((j + (gridOffset / 40)) / depthSteps, 2.6)
        const curY = vanishingY + p * (height - vanishingY + 80)
        const curWidth = width * 0.2 + p * (gridSpread - width * 0.2)
        const lineAlpha = p * (isDark ? 0.08 : 0.06)

        ctx.strokeStyle = accent.subtle.replace('0.08', String(Math.min(0.2, lineAlpha)))
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(vanishingX - curWidth / 2, curY)
        ctx.lineTo(vanishingX + curWidth / 2, curY)
        ctx.stroke()
      }
      ctx.restore()

      // ─── 3. 3D PARTICLES CONSTELLATION ───
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!reducedMotion) {
          p.z -= 0.0016
          p.x += p.vx
          p.y += p.vy
          if (p.z <= 0.02) {
            p.z = 1
            p.x = (Math.random() * 2 - 1) * 1.4
            p.y = (Math.random() * 2 - 1) * 1.4
          }
        }

        const screenX = centerX + (p.x - cam.x * 0.25) * width * 0.75 * (1 - p.z * 0.3)
        const screenY = horizonY + (p.y - cam.y * 0.25) * height * 0.75 * (1 - p.z * 0.3)

        if (screenX >= -20 && screenX <= width + 20 && screenY >= -20 && screenY <= height + 20) {
          const depthAlpha = (1 - p.z) * p.baseAlpha * (isDark ? 0.9 : 0.5)
          const radius = Math.max(0.6, (1 - p.z) * p.size * 2.2)

          ctx.beginPath()
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
          ctx.fillStyle = isDark
            ? p.z < 0.4
              ? accent.hex
              : `rgba(255, 255, 255, ${depthAlpha})`
            : p.z < 0.4
              ? accent.activeHex
              : `rgba(40, 40, 45, ${depthAlpha * 0.7})`
          ctx.fill()

          // Subtle glow around close particles
          if (p.z < 0.25 && isDark) {
            ctx.beginPath()
            ctx.arc(screenX, screenY, radius * 3.5, 0, Math.PI * 2)
            ctx.fillStyle = accent.glowSubtle
            ctx.fill()
          }
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render)
      }
    }

    resize()
    rafId = requestAnimationFrame(render)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [accent, mode, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
