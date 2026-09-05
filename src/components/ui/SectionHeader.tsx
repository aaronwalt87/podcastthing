import Link from 'next/link'

interface SectionHeaderProps {
  /** Two-digit index, e.g. "01" — the running order of the page. */
  index?: string
  eyebrow: string
  title: string
  description?: string
  action?: { label: string; href: string }
}

export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          {index && <span className="eyebrow-accent">{index}</span>}
          <span aria-hidden="true" className="h-px w-6 bg-hair-2" />
          {eyebrow}
        </p>
        <h2 className="display mt-3 text-[clamp(30px,4.4vw,52px)]">{title}</h2>
        {description && <p className="mt-3 text-[15px] text-paper-2">{description}</p>}
      </div>

      {action && (
        <Link href={action.href} className="btn btn-sm shrink-0 self-start md:self-auto">
          {action.label}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}
