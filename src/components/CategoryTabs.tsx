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
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !selected
            ? 'bg-white text-neutral-950'
            : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-white text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
