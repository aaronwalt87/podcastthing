'use client'

import { useEffect, useRef } from 'react'
import SculptureStudies, { sculptureOptions } from './SculptureStudies'
import styles from './SculptureSequence.module.css'

/** All three studies take turns in one pinned scene. Only the stage tracks the pointer. */
export default function SculptureSequence() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let x = 0
    let y = 0
    const reset = () => {
      node.style.removeProperty('--sequence-turn')
      node.style.removeProperty('--sequence-tilt')
    }
    const paint = () => {
      frame = 0
      if (reduced.matches || document.hidden) return
      node.style.setProperty('--sequence-turn', `${x * 8}deg`)
      node.style.setProperty('--sequence-tilt', `${y * -4}deg`)
    }
    const schedule = () => {
      if (!frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(paint)
    }
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = node.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
      schedule()
    }
    const leave = () => { x = 0; y = 0; schedule() }
    const environment = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (reduced.matches || document.hidden) reset()
      else schedule()
    }
    node.addEventListener('pointermove', pointer)
    node.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', environment)
    reduced.addEventListener('change', environment)
    return () => {
      cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', pointer)
      node.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', environment)
      reduced.removeEventListener('change', environment)
    }
  }, [])

  return (
    <div ref={root} className={styles.sequence}>
      <div className={`${styles.layer} ${styles.first}`}><SculptureStudies variant="strata" /><span className={styles.studyLabel}>Strata</span></div>
      <div className={`${styles.layer} ${styles.second}`}><div className={styles.fadeOut}><SculptureStudies variant="orbit" /><span className={styles.studyLabel}>Orbit</span></div></div>
      <div className={`${styles.layer} ${styles.third}`}><SculptureStudies variant="cairn" /><span className={styles.studyLabel}>Cairn</span></div>
      <div className={styles.timeline} aria-hidden="true">
        <div className={styles.names}>{sculptureOptions.map(({ id, label }, index) => <span key={id}>0{index + 1} / {label}</span>)}</div>
        <div className={styles.track}><span /></div>
      </div>
    </div>
  )
}
