'use client'

import { useEffect, useId, useRef } from 'react'
import styles from './Hero.module.css'

/** An original machined assembly. No canvas, model download, or render loop. */
export default function SystemSculpture() {
  const root = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '')

  useEffect(() => {
    const node = root.current
    if (!node) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let pointerX = 0
    let pointerY = 0
    let visible = true
    const reset = () => {
      node.style.setProperty('--turn', '0deg')
      node.style.setProperty('--tilt', '0deg')
      node.style.setProperty('--spread', '0px')
    }
    const update = () => {
      frame = 0
      if (motion.matches || document.hidden || !visible) return
      const rect = node.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)))
      node.style.setProperty('--turn', `${pointerX * 5 + progress * 7}deg`)
      node.style.setProperty('--tilt', `${pointerY * -4}deg`)
      node.style.setProperty('--spread', `${progress * 32 + Math.abs(pointerX) * 9}px`)
    }
    const schedule = () => {
      if (!frame && !motion.matches && !document.hidden && visible) frame = requestAnimationFrame(update)
    }
    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = node.getBoundingClientRect()
      pointerX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
      pointerY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
      schedule()
    }
    const handleLeave = () => { pointerX = 0; pointerY = 0; schedule() }
    const handleEnvironment = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (motion.matches || document.hidden) reset()
      else schedule()
    }
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          if (visible) schedule()
          else { cancelAnimationFrame(frame); frame = 0 }
        })
      : null
    observer?.observe(node)
    node.addEventListener('pointermove', handlePointer)
    node.addEventListener('pointerleave', handleLeave)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    document.addEventListener('visibilitychange', handleEnvironment)
    motion.addEventListener('change', handleEnvironment)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      node.removeEventListener('pointermove', handlePointer)
      node.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', handleEnvironment)
      motion.removeEventListener('change', handleEnvironment)
    }
  }, [])

  function Disc({ y, layer }: { y: number; layer: 'top' | 'middle' | 'bottom' }) {
    return (
      <g className={styles[layer]}>
        <g transform={`translate(300 ${y})`}>
          <path d="M-181 0C-181 82 181 82 181 0L181 38C181 120-181 120-181 38Z" fill={`url(#${id}-edge)`} />
          {Array.from({ length: 61 }, (_, index) => {
            const x = -177 + index * 5.9
            const top = 61.5 * Math.sqrt(Math.max(0, 1 - (x / 181) ** 2))
            return <path key={index} d={`M${x} ${top}v37`} stroke="var(--charcoal)" strokeOpacity=".42" strokeWidth="2.2" />
          })}
          <ellipse rx="181" ry="62" fill={`url(#${id}-face)`} stroke="var(--cream)" strokeOpacity=".45" strokeWidth="1" />
          {[171, 159, 146, 132, 118, 104, 90].map((r) => <ellipse key={r} rx={r} ry={r * .3425} fill="none" stroke="var(--charcoal)" strokeOpacity=".13" strokeWidth="1" />)}
          <ellipse rx="76" ry="26" fill="var(--charcoal)" />
          <path d="M-70 0C-70 28 70 28 70 0L70 9C40 34-40 34-70 9Z" fill={`url(#${id}-core)`} />
          <ellipse rx="70" ry="23" fill="none" stroke="var(--olive)" strokeWidth="2" />
          <path d="M-176 39C-152 110 159 106 179 38" fill="none" stroke="var(--cream)" strokeOpacity=".22" />
          <circle cx="-121" cy="-21" r="3" fill="var(--charcoal)" fillOpacity=".6" />
          <circle cx="123" cy="21" r="3" fill="var(--charcoal)" fillOpacity=".6" />
        </g>
      </g>
    )
  }

  return (
    <div ref={root} className={styles.sculpture} aria-hidden="true">
      <svg viewBox="0 0 600 620" fill="none" className={styles.assembly}>
        <defs>
          <linearGradient id={`${id}-face`} x1="-150" y1="-55" x2="180" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--cream)" /><stop offset=".38" stopColor="var(--olive-light)" /><stop offset=".8" stopColor="var(--olive-light)" /><stop offset="1" stopColor="var(--olive)" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="-181" y1="0" x2="181" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--charcoal)" /><stop offset=".2" stopColor="var(--olive-light)" /><stop offset=".38" stopColor="var(--cream)" /><stop offset=".65" stopColor="var(--olive)" /><stop offset="1" stopColor="var(--charcoal)" />
          </linearGradient>
          <linearGradient id={`${id}-core`} x1="-70" y1="0" x2="70" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--charcoal)" /><stop offset=".25" stopColor="var(--ember)" /><stop offset=".45" stopColor="var(--ember-2)" /><stop offset=".8" stopColor="var(--ember)" /><stop offset="1" stopColor="var(--charcoal)" />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}><stop stopColor="var(--charcoal)" stopOpacity=".7" /><stop offset="1" stopColor="var(--charcoal)" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="302" cy="532" rx="238" ry="48" fill={`url(#${id}-shadow)`} />
        <g className={styles.machine}>
          <Disc y={391} layer="bottom" />
          <g transform="translate(300 0)">
            <path d="M-66 148C-66 177 66 177 66 148V397C66 427-66 427-66 397Z" fill={`url(#${id}-core)`} />
            {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-65 ${169 + i * 16}C-50 ${199 + i * 16} 50 ${199 + i * 16} 65 ${169 + i * 16}`} stroke="var(--charcoal)" strokeOpacity=".22" strokeWidth="2" />)}
          </g>
          <Disc y={276} layer="middle" />
          <Disc y={159} layer="top" />
          <g className={styles.top}>
            <g transform="translate(300 150)">
              <path d="M-42-30C-42-12 42-12 42-30V1C42 20-42 20-42 1Z" fill={`url(#${id}-core)`} />
              <ellipse cy="-30" rx="42" ry="15" fill="var(--ember-2)" /><ellipse cy="-30" rx="21" ry="7" fill="var(--charcoal)" /><ellipse cy="-28" rx="16" ry="4" fill="var(--ember)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
