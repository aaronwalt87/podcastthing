'use client'

import { useEffect, useId, useRef } from 'react'
import hero from './Hero.module.css'
import styles from './SculptureStudies.module.css'

export type SculptureOption = 'strata' | 'orbit' | 'cairn'
export const sculptureOptions: { id: SculptureOption; label: string }[] = [
  { id: 'strata', label: 'Strata' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'cairn', label: 'Cairn' },
]

function Strata({ id }: { id: string }) {
  function Disc({ y, width, layer, accent = false }: { y: number; width: number; layer: string; accent?: boolean }) {
    const rise = width * .29
    return (
      <g className={layer}><g transform={`translate(300 ${y})`}>
        <ellipse cy="54" rx={width + 8} ry={rise} fill="var(--charcoal)" opacity=".17" />
        <path d={`M${-width} 0C${-width} ${rise * 1.4} ${width} ${rise * 1.4} ${width} 0V32C${width} ${rise * 1.4 + 32} ${-width} ${rise * 1.4 + 32} ${-width} 32Z`} fill={`url(#${id}-side)`} />
        {Array.from({ length: 43 }, (_, i) => {
          const x = -width + 10 + i * (2 * width - 20) / 42
          const edge = rise * Math.sqrt(Math.max(0, 1 - (x / width) ** 2))
          return <path key={i} d={`M${x} ${edge}v32`} stroke="var(--charcoal)" strokeOpacity=".3" strokeWidth="2" />
        })}
        <ellipse rx={width} ry={rise} fill={`url(#${id}-ivory)`} stroke="var(--cream)" strokeOpacity=".65" strokeWidth="2" />
        {[.87, .71, .53].map(s => <ellipse key={s} rx={width * s} ry={rise * s} fill="none" stroke="var(--charcoal)" strokeOpacity=".16" strokeWidth="1.5" />)}
        <ellipse rx={width * .24} ry={rise * .24} fill={accent ? `url(#${id}-ember)` : 'var(--olive)'} />
        <ellipse cy="-2" rx={width * .15} ry={rise * .15} fill={accent ? 'var(--ember)' : 'var(--charcoal)'} />
        <circle cx={-width * .72} cy={-rise * .23} r="3" fill="var(--charcoal)" opacity=".55" />
        <circle cx={width * .72} cy={rise * .23} r="3" fill="var(--charcoal)" opacity=".55" />
      </g></g>
    )
  }
  return (
    <g className={styles.strata}>
      <ellipse cx="300" cy="587" rx="215" ry="29" fill={`url(#${id}-shadow)`} />
      <Disc y={460} width={168} layer={styles.strataBottom} />
      <Disc y={290} width={190} layer={styles.strataMiddle} accent />
      <Disc y={120} width={154} layer={styles.strataTop} />
    </g>
  )
}

function Orbit({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx="300" cy="538" rx="194" ry="28" fill={`url(#${id}-shadow)`} />
      <g className={styles.orbitOuter}>
        <ellipse cx="300" cy="306" rx="208" ry="137" stroke="var(--charcoal)" strokeWidth="23" />
        <ellipse cx="300" cy="306" rx="208" ry="137" stroke={`url(#${id}-ivory)`} strokeWidth="17" />
        <circle cx="92" cy="306" r="8" fill="var(--ember)" /><circle cx="508" cy="306" r="8" fill="var(--ember)" />
      </g>
      <g className={styles.orbitInner}>
        <ellipse cx="300" cy="306" rx="143" ry="176" stroke="var(--charcoal)" strokeWidth="20" />
        <ellipse cx="300" cy="306" rx="143" ry="176" stroke={`url(#${id}-ivory)`} strokeWidth="14" />
        <circle cx="157" cy="306" r="7" fill="var(--charcoal)" /><circle cx="443" cy="306" r="7" fill="var(--charcoal)" />
      </g>
      <g className={styles.orbitCore}>
        <circle cx="300" cy="306" r="90" fill="var(--charcoal)" />
        <circle cx="300" cy="306" r="79" fill={`url(#${id}-ember)`} />
        <circle cx="300" cy="306" r="63" stroke="var(--charcoal)" strokeOpacity=".22" strokeWidth="2" />
        <path d="M263 254C272 241 284 237 302 235" stroke="var(--cream)" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Cairn({ id }: { id: string }) {
  function Tier({ y, size, height, layer, dark = false }: { y: number; size: number; height: number; layer: string; dark?: boolean }) {
    const d = size * .48
    return (
      <g className={layer}><g transform={`translate(300 ${y})`}>
        <path d={`M0 ${d}L${size} 0V${height}L0 ${d + height}Z`} fill={dark ? 'var(--charcoal)' : `url(#${id}-side)`} />
        <path d={`M0 ${d}L${-size} 0V${height}L0 ${d + height}Z`} fill={dark ? 'var(--olive)' : 'var(--olive-light)'} />
        <path d={`M0 ${-d}L${size} 0L0 ${d}L${-size} 0Z`} fill={dark ? 'var(--olive)' : `url(#${id}-ivory)`} stroke="var(--cream)" strokeOpacity=".55" strokeWidth="2" />
        {[.72, .43].map(s => <path key={s} d={`M0 ${-d * s}L${size * s} 0L0 ${d * s}L${-size * s} 0Z`} stroke={dark ? 'var(--cream)' : 'var(--charcoal)'} strokeOpacity=".21" strokeWidth="2" />)}
        <path d={`M${-size + 10} ${height - 8}L0 ${d + height - 8}L${size - 10} ${height - 8}`} stroke={dark ? 'var(--ember)' : 'var(--cream)'} strokeOpacity=".55" strokeWidth="2" />
      </g></g>
    )
  }
  return (
    <g className={styles.cairn}>
      <ellipse cx="300" cy="544" rx="210" ry="29" fill={`url(#${id}-shadow)`} />
      <Tier y={358} size={170} height={48} layer={styles.cairnBase} />
      <Tier y={281} size={137} height={45} layer={styles.cairnMiddle} dark />
      <Tier y={207} size={103} height={40} layer={styles.cairnTop} />
      <g className={styles.beacon}>
        <path d="M300 98L340 118V151L300 171L260 151V118Z" fill={`url(#${id}-ember)`} />
        <path d="M300 98L340 118L300 138L260 118Z" fill="var(--ember)" />
        <path d="M300 138L340 118V151L300 171Z" fill="var(--ember-2)" />
        <path d="M300 138L260 118V151L300 171Z" fill="var(--ember)" opacity=".75" />
      </g>
    </g>
  )
}

/** Three closed-form objects driven by the existing native-scroll progress. */
export default function SculptureStudies({ variant }: { variant: SculptureOption }) {
  const root = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '')
  useEffect(() => {
    const node = root.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let x = 0
    let y = 0
    let visible = true
    const reset = () => { node.style.setProperty('--turn', '0deg'); node.style.setProperty('--tilt', '0deg') }
    const update = () => {
      frame = 0
      if (reduced.matches || document.hidden || !visible) return
      node.style.setProperty('--turn', `${x * 8}deg`)
      node.style.setProperty('--tilt', `${y * -4}deg`)
    }
    const schedule = () => {
      if (!frame && !reduced.matches && !document.hidden && visible) frame = requestAnimationFrame(update)
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
      cancelAnimationFrame(frame); frame = 0
      if (reduced.matches || document.hidden) reset()
      else schedule()
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else { cancelAnimationFrame(frame); frame = 0 }
    })
    observer?.observe(node)
    node.addEventListener('pointermove', pointer)
    node.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', environment)
    reduced.addEventListener('change', environment)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      node.removeEventListener('pointermove', pointer)
      node.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', environment)
      reduced.removeEventListener('change', environment)
    }
  }, [])

  return (
    <div ref={root} className={hero.sculpture} aria-hidden="true">
      <svg viewBox="0 0 600 620" fill="none" className={hero.assembly}>
        <defs>
          <linearGradient id={`${id}-ivory`} x1="110" y1="130" x2="500" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="var(--cream)" /><stop offset=".6" stopColor="var(--olive-light)" /><stop offset="1" stopColor="var(--cream)" /></linearGradient>
          <linearGradient id={`${id}-side`} x1="0" x2="1" y1="0" y2="0"><stop stopColor="var(--charcoal)" /><stop offset=".38" stopColor="var(--cream)" /><stop offset="1" stopColor="var(--olive)" /></linearGradient>
          <radialGradient id={`${id}-ember`} cx="32%" cy="25%" r="80%"><stop stopColor="var(--cream)" /><stop offset=".2" stopColor="var(--ember)" /><stop offset=".8" stopColor="var(--ember-2)" /><stop offset="1" stopColor="var(--charcoal)" /></radialGradient>
          <radialGradient id={`${id}-shadow`}><stop stopColor="var(--charcoal)" stopOpacity=".55" /><stop offset="1" stopColor="var(--charcoal)" stopOpacity="0" /></radialGradient>
        </defs>
        {variant === 'strata' ? <Strata id={id} /> : variant === 'orbit' ? <Orbit id={id} /> : <Cairn id={id} />}
      </svg>
    </div>
  )
}
