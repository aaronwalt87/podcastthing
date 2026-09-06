export interface Episode {
  id: string
  title: string
  showName: string
  description: string
  audioUrl: string
  audioType: 'upload' | 'url'
  thumbnailUrl?: string
  category?: string
  /**
   * Link to the publisher's transcript. Audio-only content needs a text
   * alternative (WCAG 1.2.1); since these episodes are curated rather than
   * produced here, the alternative is the publisher's own transcript, and the
   * UI says plainly when there is not one.
   */
  transcriptUrl?: string
  /** Episode page at the publisher, for anything a transcript cannot cover. */
  sourceUrl?: string
  addedAt: number // Unix ms timestamp
}
