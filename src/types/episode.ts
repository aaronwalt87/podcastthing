export interface Episode {
  id: string
  title: string
  showName: string
  description: string
  audioUrl: string
  audioType: 'upload' | 'url'
  thumbnailUrl?: string
  addedAt: number // Unix ms timestamp
}
