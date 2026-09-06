export type SearchKind = 'episode' | 'news' | 'symbol'

export interface SearchRecord {
  id: string
  kind: SearchKind
  title: string
  subtitle: string
  href: string
  /** External links open in a new tab; internal ones navigate in place. */
  external: boolean
}
