'use client'

import { useEffect, useRef } from 'react'
import styles from './ScrollScene.module.css'

/** Native scrolling drives a bounded, time-based easing loop, not React renders. */
export default function ScrollScene({ children, kind = 'chapter', className = '' }: {
  children: React.ReactNode
  kind?: 'hero' | 'chapter'
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia('(min-width: 900px) and (min-height: 700px)')
    let frame = 0
    let previous = 0
    let current = 0
    let target = 0
    let visible = true
    const clamp = (value: number) => Math.max(0, Math.min(1, value))
    const measure = () => {
      const rect = node.getBoundingClientRect()
      const header = parseFloat(getComputedStyle(node).getPropertyValue('--header-h')) || 80
      if (kind === 'hero' && wide.matches) {
        target = clamp((header - rect.top) / Math.max(1, rect.height - window.innerHeight + header))
      } else if (kind === 'hero') {
        const anchor = node.querySelector('[data-scroll-anchor]') ?? node
        const bounds = anchor.getBoundingClientRect()
        target = clamp((window.innerHeight * .85 - bounds.top) / Math.max(1, bounds.height + window.innerHeight * .25))
      } else {
        target = clamp((window.innerHeight * .95 - rect.top) / (window.innerHeight * .75))
      }
    }
    const paint = () => node.style.setProperty('--scene-progress', current.toFixed(4))
    const tick = (time: number) => {
      frame = 0
      if (reduced.matches || document.hidden || !visible) return
      const dt = previous ? Math.min(time - previous, 64) : 16
      previous = time
      current += (target - current) * (1 - Math.exp(-dt / 95))
      if (Math.abs(target - current) < .0005) current = target
      paint()
      if (current !== target) frame = requestAnimationFrame(tick)
      else previous = 0
    }
    const schedule = () => {
      if (reduced.matches || document.hidden || !visible) return
      measure()
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const configure = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      node.dataset.motion = reduced.matches ? 'off' : 'on'
      if (reduced.matches) {
        node.style.removeProperty('--scene-progress')
      } else {
        measure()
        current = target
        paint()
      }
    }
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0 }
      else schedule()
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else { cancelAnimationFrame(frame); frame = 0; previous = 0 }
    }, { rootMargin: '150px 0px' })
    configure()
    observer?.observe(node)
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resize?.observe(node)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', configure)
    wide.addEventListener('change', configure)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      resize?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', configure)
      wide.removeEventListener('change', configure)
    }
  }, [kind])

  return <div ref={ref} className={`${styles.scene} ${className}`} data-scene={kind}>{children}</div>
}
