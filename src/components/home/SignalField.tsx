'use client'

import { useEffect, useRef } from 'react'

interface SignalFieldProps {
  /**
   * Real series (normally 60 daily closes) drawn as the front ridge. Anything
   * behind it is generated. Passing an empty array degrades to generated only.
   */
  series: number[]
  className?: string
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
export default function SignalField({ series, className = '' }: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let frame = 0
    let running = true

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
    }

    const drawGeneratedLayer = (index: number, time: number) => {
      const depth = index / LAYERS
      // Back layers sit higher, move less, and fade out.
      const baseline = height * (0.52 + depth * 0.13)
      const amplitude = height * (0.16 - depth * 0.022)
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

      const fill = ctx.createLinearGradient(0, baseline - amplitude, 0, height)
      fill.addColorStop(0, `rgba(255, 106, 43, ${(alpha * 0.14).toFixed(3)})`)
      fill.addColorStop(1, 'rgba(255, 106, 43, 0)')
      ctx.fillStyle = fill
      ctx.fill()

      ctx.strokeStyle = `rgba(180, 196, 214, ${(alpha * 0.3).toFixed(3)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const drawSeriesLayer = (time: number) => {
      if (normalised.length < 2) return

      const baseline = height * 0.78
      const amplitude = height * 0.3
      // A slow vertical breath keeps the real line alive without distorting it.
      const breath = reduceMotion ? 0 : Math.sin(time * 0.4) * 2

      ctx.beginPath()
      normalised.forEach((value, i) => {
        const x = (i / (normalised.length - 1)) * width
        const y = baseline - value * amplitude + breath
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      ctx.strokeStyle = 'rgba(255, 106, 43, 0.85)'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(255, 106, 43, 0.55)'
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.shadowBlur = 0

      // Mark the latest close.
      const lastValue = normalised[normalised.length - 1]
      const lastY = baseline - lastValue * amplitude + breath
      ctx.beginPath()
      ctx.arc(width, lastY, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 168, 119, 1)'
      ctx.fill()
    }

    const render = (timestampMs: number) => {
      if (!running) return
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

    start()

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => start()) : null
    observer?.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [series])

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
