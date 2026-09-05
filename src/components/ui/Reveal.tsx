'use client'

import { useEffect, useRef } from 'react'

interface RevealProps {
  children: React.ReactNode
  /** Stagger, in milliseconds, applied as a CSS transition-delay. */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

/** Elements this far below the fold are hidden before their reveal. */
const HIDE_THRESHOLD = 1.05

/**
 * Fades content up the first time it scrolls into view.
 *
 * Content is rendered *visible*, and only hidden after mount, and only when it
 * is far enough below the viewport that hiding it can't flash. That ordering
 * matters: server-rendered HTML, a failed hydration, or a browser without
 * IntersectionObserver all end up showing the content rather than a blank gap.
 */
export default function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || typeof IntersectionObserver === 'undefined') return

    // Already on screen (or nearly): leave it alone.
    if (node.getBoundingClientRect().top < window.innerHeight * HIDE_THRESHOLD) return

    node.setAttribute('data-reveal', '')

    let delivered = false

    const show = () => {
      node.setAttribute('data-shown', 'true')
      observer.disconnect()
      window.clearTimeout(failsafe)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        delivered = true
        if (entry.isIntersecting) show()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    observer.observe(node)

    /**
     * Guards only against the observer never reporting at all. An unconditional
     * timer would reveal everything two seconds after load, so nothing below the
     * first screen would ever animate — IntersectionObserver always delivers an
     * initial entry, so a missing `delivered` flag is the real failure.
     */
    const failsafe = window.setTimeout(() => {
      if (!delivered) show()
    }, 2000)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  const Tag = as as React.ElementType

  return (
    <Tag
      ref={ref}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
