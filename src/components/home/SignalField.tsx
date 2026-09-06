'use client'

import { useEffect, useRef } from 'react'

interface SignalFieldProps {
  /**
   * Real series (normally 60 daily closes) drawn as the front ridge. Anything
   * behind it is generated. Passing an empty array degrades to generated only.
   */
  series: number[]
  className?: string
  /**
   * `hero` fills a tall block; `band` compresses the same drawing into a short
   * horizontal strip, where a hero's proportions would leave the ridge hugging
   * the floor with half the box empty.
   */
  variant?: 'hero' | 'band'
}

const LAYERS = 5

/** Smooth deterministic noise — layered sines, no dependency, no allocation. */
function ridge(x: number, seed: number, time: number): number {
  return (
    Math.sin(x * 1.7 + seed * 2.3 + time * 0.22) * 0.5 +
    Math.sin(x * 3.9 + seed * 5.1 - time * 0.14) * 0.28 +
    Math.sin(x * 8.3 + seed * 1.7 + time * 0.34) * 0.12
  )
}

/**
 * Layered ridge field. The back layers drift; the front layer is the market
 * series itself, so the artwork is a readout rather than an ornament.
 */
export default function SignalField({
  series,
  className = '',
  variant = 'hero',
}: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
    let reduceMotion = motionQuery?.matches ?? false

    let width = 0
    let height = 0
    let frame = 0
    let running = true
    let onScreen = true
    /** Rebuilt on resize — allocating five gradients per frame is 300/s of GC. */
    let fills: CanvasGradient[] = []

    // Normalise the series to 0..1 once; redrawing shouldn't recompute it.
    const normalised: number[] = (() => {
      if (series.length < 2) return []
      const min = Math.min(...series)
      const max = Math.max(...series)
      const range = max - min || 1
      return series.map((v) => (v - min) / range)
    })()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Gradients depend only on height, so they are built here, not per frame.
      fills = Array.from({ length: LAYERS }, (_, index) => {
        const depth = index / LAYERS
        const baseline = height * (variant === 'band' ? 0.72 + depth * 0.1 : 0.52 + depth * 0.13)
        const amplitude = height * (variant === 'band' ? 0.3 - depth * 0.04 : 0.16 - depth * 0.022)
        const alpha = 0.5 - depth * 0.4

        const fill = ctx.createLinearGradient(0, baseline - amplitude, 0, height)
        fill.addColorStop(0, `rgba(255, 106, 43, ${(alpha * 0.14).toFixed(3)})`)
        fill.addColorStop(1, 'rgba(255, 106, 43, 0)')
        return fill
      })
    }

    const drawGeneratedLayer = (index: number, time: number) => {
      const depth = index / LAYERS
      // Back layers sit higher, move less, and fade out.
      const baseline = height * (variant === 'band' ? 0.72 + depth * 0.1 : 0.52 + depth * 0.13)
      const amplitude = height * (variant === 'band' ? 0.3 - depth * 0.04 : 0.16 - depth * 0.022)
      const alpha = 0.5 - depth * 0.4

      ctx.beginPath()
      ctx.moveTo(0, height)

      const step = 4
      for (let x = 0; x <= width; x += step) {
        const t = x / width
        const y = baseline - ridge(t * 2.4, index + 1, time * (1 - depth * 0.5)) * amplitude
        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.closePath()

      ctx.fillStyle = fills[index] ?? 'rgba(255, 106, 43, 0)'
      ctx.fill()

      ctx.strokeStyle = `rgba(180, 196, 214, ${(alpha * 0.5).toFixed(3)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const drawSeriesLayer = (time: number) => {
      if (normalised.length < 2) return

      const baseline = height * (variant === 'band' ? 0.93 : 0.78)
      const amplitude = height * (variant === 'band' ? 0.78 : 0.3)
      // A slow vertical breath keeps the real line alive without distorting it.
      const breath = reduceMotion ? 0 : Math.sin(time * 0.4) * 2

      // Inset so the terminus dot reads as an endpoint rather than a clipped edge.
      const right = width - 6

      ctx.beginPath()
      normalised.forEach((value, i) => {
        const x = (i / (normalised.length - 1)) * right
        const y = baseline - value * amplitude + breath
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      // Two strokes instead of shadowBlur: visually equivalent glow, an order of
      // magnitude cheaper per frame.
      ctx.strokeStyle = 'rgba(255, 106, 43, 0.16)'
      ctx.lineWidth = 5
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255, 106, 43, 0.9)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Mark the latest close.
      const lastValue = normalised[normalised.length - 1]
      const lastY = baseline - lastValue * amplitude + breath
      ctx.beginPath()
      ctx.arc(right, lastY, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 168, 119, 1)'
      ctx.fill()
    }

    const render = (timestampMs: number) => {
      if (!running || !onScreen) return
      const time = timestampMs / 1000

      ctx.clearRect(0, 0, width, height)
      for (let i = LAYERS - 1; i >= 0; i--) drawGeneratedLayer(i, time)
      drawSeriesLayer(time)

      if (!reduceMotion) frame = requestAnimationFrame(render)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      resize()
      if (reduceMotion) render(0)
      else frame = requestAnimationFrame(render)
    }

    // Don't burn frames on a hidden tab.
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
      } else {
        running = true
        start()
      }
    }

    // …or while the canvas is scrolled off screen, which is most of the visit.
    const visibility =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting
            if (onScreen) start()
            else cancelAnimationFrame(frame)
          })
        : null
    visibility?.observe(canvas)

    const onMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches
      start()
    }
    motionQuery?.addEventListener('change', onMotionChange)

    start()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => start()) : null
    resizeObserver?.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      visibility?.disconnect()
      motionQuery?.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [series, variant])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
