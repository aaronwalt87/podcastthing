'use client'

import { useCallback } from 'react'

interface SpotlightProps {
  children: React.ReactNode
  className?: string
}

/**
 * Tracks the pointer and exposes it as --mx/--my so `.spotlight` can render a
 * soft highlight that follows the cursor. Writes straight to the DOM node so a
 * pointer move never triggers a React render.
 */
export default function Spotlight({ children, className = '' }: SpotlightProps) {
  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    el.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, [])

  return (
    <div className={`spotlight ${className}`} onPointerMove={onPointerMove}>
      {children}
    </div>
  )
}
