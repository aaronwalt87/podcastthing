import type { ReactNode } from 'react'
import styles from './PageMasthead.module.css'

interface PageMastheadProps {
  index: string
  eyebrow: ReactNode
  title: string
  children?: ReactNode
  meta?: ReactNode
}

/** A shared editorial opening; the content below remains specific to each route. */
export default function PageMasthead({ index, eyebrow, title, children, meta }: PageMastheadProps) {
  return (
    <header className={styles.masthead}>
      <div className={styles.topline}>
        <p className="eyebrow">{eyebrow}</p>
        <span className="num" aria-hidden="true">FIELD NOTES / {index}</span>
      </div>
      <h1 className={styles.title}>{title}<span className={styles.period}>.</span></h1>
      {children && <div className={styles.intro}>
        <div className={styles.chapter} aria-hidden="true">
          <span className={styles.chapterMark}>↳</span>
          <span className="num">{index}</span>
        </div>
        <div className={styles.description}>{children}</div>
      </div>}
      {meta && <div className={styles.meta}>{meta}</div>}
    </header>
  )
}
