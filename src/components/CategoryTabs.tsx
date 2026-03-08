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

  return (
    <div className="flex items-center gap-0 flex-wrap border border-blue-900/40 p-0 w-fit">
      <button
        onClick={() => navigate(undefined)}
        className={`px-4 py-1.5 text-xs tracking-widest font-mono transition-all duration-150 border-r border-blue-900/40 ${
          !selected
            ? 'bg-amber-400 text-black font-bold'
            : 'bg-transparent text-blue-400 hover:bg-blue-900/30 hover:text-blue-200'
        }`}
        style={!selected ? { boxShadow: '0 0 10px rgba(251,191,36,0.4)' } : undefined}
      >
        ALL
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className={`px-4 py-1.5 text-xs tracking-widest font-mono transition-all duration-150 border-r border-blue-900/40 last:border-r-0 ${
            selected === cat
              ? 'bg-amber-400 text-black font-bold'
              : 'bg-transparent text-blue-400 hover:bg-blue-900/30 hover:text-blue-200'
          }`}
          style={selected === cat ? { boxShadow: '0 0 10px rgba(251,191,36,0.4)' } : undefined}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
