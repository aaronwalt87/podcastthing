export interface NewsItem {
  id: string
  title: string
  link: string
  source: string
  sourceType: 'rss' | 'social'
  publishedAt: number
  summary: string
}
