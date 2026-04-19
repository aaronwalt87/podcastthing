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
    background: active ? '#FF3B3B' : '#1c1b1b',
    color: active ? '#410003' : '#e5e2e1',
    borderLeft: active ? '1px solid #FF3B3B' : '1px solid #67d7e1',
    boxShadow: active ? '0 0 8px rgba(255,59,59,0.3)' : undefined,
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
