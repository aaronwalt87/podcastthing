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

  const allTabs = [{ label: 'ALL', value: undefined }, ...categories.map((c) => ({ label: c, value: c }))]

  return (
    <div className="flex items-stretch gap-1 w-max min-w-full sm:min-w-0">
      {allTabs.map(({ label, value }) => {
        const active = selected === value
        return (
          <button
            key={label}
            onClick={() => navigate(value)}
            className="px-3 sm:px-4 py-1.5 text-xs font-mono tracking-widest whitespace-nowrap transition-all duration-100"
            style={active ? {
              background: '#cc2010',
              color: '#f5ead8',
              border: '2px solid #8b1508',
              borderBottom: '3px solid #6a1006',
              fontWeight: 700,
            } : {
              background: '#c4b488',
              color: '#4a3010',
              border: '2px solid #a09060',
              borderBottom: '3px solid #8a7840',
            }}
          >
            {label.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
