'use client'

import { useRouter } from 'next/navigation'

interface CategoryTabsProps {
  categories: string[]
  selected: string | undefined
}

export default function CategoryTabs({ categories, selected }: CategoryTabsProps) {
  const router = useRouter()

  const navigate = (category: string | undefined) => {
    if (category) {
      router.push(`/?category=${encodeURIComponent(category)}`)
    } else {
      router.push('/')
    }
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Space Grotesk', sans-serif",
    background: active ? '#00FF41' : 'rgba(20,20,20,0.7)',
    color: active ? '#131313' : '#b9ccb2',
    border: active ? '1px solid #00FF41' : '1px solid rgba(255,255,255,0.1)',
    boxShadow: active ? '0 0 8px rgba(0,255,65,0.35)' : undefined,
  })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => navigate(undefined)}
        className="px-3 py-1 text-xs tracking-widest uppercase transition-all duration-150"
        style={chipStyle(!selected)}
      >
        ALL
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className="px-3 py-1 text-xs tracking-widest uppercase transition-all duration-150"
          style={chipStyle(selected === cat)}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
