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
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => navigate(undefined)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          !selected
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
            : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-violet-500/30'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
              : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-violet-500/30'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
