import { v4 as uuidv4 } from 'uuid'
import redis from './redis'
import type { Episode } from '@/types/episode'

const INDEX_KEY = 'episodes_index'
const episodeKey = (id: string) => `episodes:${id}`

export async function getAllEpisodes(): Promise<Episode[]> {
  // Get all IDs ordered newest first
  const ids = await redis.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true })
  if (!ids || ids.length === 0) return []

  // Fetch all episode hashes in a pipeline
  const pipeline = redis.pipeline()
  for (const id of ids) {
    pipeline.hgetall(episodeKey(id))
  }
  const results = await pipeline.exec()

  const episodes: Episode[] = []
  for (const result of results) {
    if (result && typeof result === 'object') {
      const ep = result as Record<string, string>
      episodes.push({
        id: ep.id,
        title: ep.title,
        showName: ep.showName,
        description: ep.description,
        audioUrl: ep.audioUrl,
        audioType: ep.audioType as 'upload' | 'url',
        thumbnailUrl: ep.thumbnailUrl || undefined,
        category: ep.category || undefined,
        addedAt: Number(ep.addedAt),
      })
    }
  }

  return episodes
}

export async function getEpisode(id: string): Promise<Episode | null> {
  const data = await redis.hgetall<Record<string, string>>(episodeKey(id))
  if (!data || !data.id) return null

  return {
    id: data.id,
    title: data.title,
    showName: data.showName,
    description: data.description,
    audioUrl: data.audioUrl,
    audioType: data.audioType as 'upload' | 'url',
    thumbnailUrl: data.thumbnailUrl || undefined,
    category: data.category || undefined,
    addedAt: Number(data.addedAt),
  }
}

export async function createEpisode(
  input: Omit<Episode, 'id' | 'addedAt'>
): Promise<Episode> {
  const episode: Episode = {
    ...input,
    id: uuidv4(),
    addedAt: Date.now(),
  }

  // Store episode fields (Redis hset needs plain object with string values)
  const fields: Record<string, string> = {
    id: episode.id,
    title: episode.title,
    showName: episode.showName,
    description: episode.description,
    audioUrl: episode.audioUrl,
    audioType: episode.audioType,
    addedAt: String(episode.addedAt),
  }
  if (episode.thumbnailUrl) {
    fields.thumbnailUrl = episode.thumbnailUrl
  }
  if (episode.category) {
    fields.category = episode.category
  }

  await redis.hset(episodeKey(episode.id), fields)
  await redis.zadd(INDEX_KEY, { score: episode.addedAt, member: episode.id })

  return episode
}

export async function updateEpisode(
  id: string,
  input: Partial<Omit<Episode, 'id' | 'addedAt'>>
): Promise<Episode | null> {
  const existing = await getEpisode(id)
  if (!existing) return null

  const updated: Episode = { ...existing, ...input }

  const fields: Record<string, string> = {
    id: updated.id,
    title: updated.title,
    showName: updated.showName,
    description: updated.description,
    audioUrl: updated.audioUrl,
    audioType: updated.audioType,
    addedAt: String(updated.addedAt),
  }

  const toClear: string[] = []

  if (updated.thumbnailUrl) {
    fields.thumbnailUrl = updated.thumbnailUrl
  } else if ('thumbnailUrl' in input) {
    toClear.push('thumbnailUrl')
  }

  if (updated.category) {
    fields.category = updated.category
  } else if ('category' in input) {
    toClear.push('category')
  }

  await redis.hset(episodeKey(id), fields)
  if (toClear.length > 0) {
    await redis.hdel(episodeKey(id), ...toClear)
  }
  return updated
}

export async function deleteEpisode(id: string): Promise<boolean> {
  const pipeline = redis.pipeline()
  pipeline.del(episodeKey(id))
  pipeline.zrem(INDEX_KEY, id)
  await pipeline.exec()
  return true
}

export async function getAllCategories(): Promise<string[]> {
  const episodes = await getAllEpisodes()
  const seen = new Set<string>()
  for (const ep of episodes) {
    if (ep.category) seen.add(ep.category)
  }
  return Array.from(seen).sort()
}
