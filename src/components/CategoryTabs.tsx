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
    <div className="flex items-center gap-0 flex-wrap w-fit"
         style={{ border: '1px solid rgba(122,80,40,0.4)' }}>
      <button
        onClick={() => navigate(undefined)}
        className="px-4 py-1.5 text-xs tracking-widest font-mono transition-all duration-150"
        style={!selected
          ? { background: '#cc2810', color: '#f5ead0', fontWeight: 700, boxShadow: '0 0 10px rgba(204,40,16,0.4)', borderRight: '1px solid rgba(122,80,40,0.4)' }
          : { background: 'transparent', color: '#a07850', borderRight: '1px solid rgba(122,80,40,0.4)' }
        }
      >
        ALL
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className="px-4 py-1.5 text-xs tracking-widest font-mono transition-all duration-150"
          style={selected === cat
            ? { background: '#cc2810', color: '#f5ead0', fontWeight: 700, boxShadow: '0 0 10px rgba(204,40,16,0.4)', borderRight: '1px solid rgba(122,80,40,0.4)' }
            : { background: 'transparent', color: '#a07850', borderRight: '1px solid rgba(122,80,40,0.4)' }
          }
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
