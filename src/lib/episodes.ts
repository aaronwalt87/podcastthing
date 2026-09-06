import 'server-only'
import { cache } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getRedis } from './redis'
import { sampleEpisodes, sampleDataEnabled } from './sample-data'
import type { Episode } from '@/types/episode'

const INDEX_KEY = 'episodes_index'
const episodeKey = (id: string) => `episodes:${id}`

/** Shape a raw Redis hash into an Episode, or null if the record is unusable. */
function toEpisode(raw: Record<string, string> | null | undefined): Episode | null {
  if (!raw || !raw.id) return null
  return {
    id: raw.id,
    title: raw.title ?? 'Untitled',
    showName: raw.showName ?? '',
    description: raw.description ?? '',
    audioUrl: raw.audioUrl ?? '',
    audioType: (raw.audioType as Episode['audioType']) ?? 'url',
    thumbnailUrl: raw.thumbnailUrl || undefined,
    category: raw.category || undefined,
    transcriptUrl: raw.transcriptUrl || undefined,
    sourceUrl: raw.sourceUrl || undefined,
    addedAt: Number(raw.addedAt) || 0,
  }
}

/**
 * Deduplicated per request. /podcasts alone calls this three times (episodes,
 * categories, shows); without `cache()` that is three full zrange + pipeline
 * round-trips against a per-command-priced store.
 */
export const getAllEpisodes = cache(async function getAllEpisodes(): Promise<Episode[]> {
  const redis = getRedis()
  // Local dev with no credentials renders fixtures; production renders empty.
  if (!redis) return sampleDataEnabled() ? sampleEpisodes() : []

  try {
    const ids = await redis.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true })
    if (!ids || ids.length === 0) return []

    const pipeline = redis.pipeline()
    for (const id of ids) {
      pipeline.hgetall(episodeKey(id))
    }
    const results = await pipeline.exec()

    return results
      .map((result) => toEpisode(result as Record<string, string> | null))
      .filter((ep): ep is Episode => ep !== null)
  } catch (err) {
    console.error('[episodes] getAllEpisodes failed', err)
    return []
  }
})

export async function getEpisode(id: string): Promise<Episode | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const data = await redis.hgetall<Record<string, string>>(episodeKey(id))
    return toEpisode(data)
  } catch (err) {
    console.error('[episodes] getEpisode failed', err)
    return null
  }
}

/** Serialise an Episode to the flat string map Redis hashes need. */
function toFields(episode: Episode): Record<string, string> {
  const fields: Record<string, string> = {
    id: episode.id,
    title: episode.title,
    showName: episode.showName,
    description: episode.description,
    audioUrl: episode.audioUrl,
    audioType: episode.audioType,
    addedAt: String(episode.addedAt),
  }
  if (episode.thumbnailUrl) fields.thumbnailUrl = episode.thumbnailUrl
  if (episode.category) fields.category = episode.category
  if (episode.transcriptUrl) fields.transcriptUrl = episode.transcriptUrl
  if (episode.sourceUrl) fields.sourceUrl = episode.sourceUrl
  return fields
}

export async function createEpisode(
  input: Omit<Episode, 'id' | 'addedAt'>
): Promise<Episode> {
  const redis = getRedis()
  if (!redis) throw new Error('Storage is not configured')

  const episode: Episode = { ...input, id: uuidv4(), addedAt: Date.now() }

  await redis.hset(episodeKey(episode.id), toFields(episode))
  await redis.zadd(INDEX_KEY, { score: episode.addedAt, member: episode.id })

  return episode
}

export async function updateEpisode(
  id: string,
  input: Partial<Omit<Episode, 'id' | 'addedAt'>>
): Promise<Episode | null> {
  const redis = getRedis()
  if (!redis) throw new Error('Storage is not configured')

  const existing = await getEpisode(id)
  if (!existing) return null

  const updated: Episode = { ...existing, ...input }
  const fields = toFields(updated)

  // Optional fields cleared in this update must be removed, not left stale.
  const toClear: string[] = []
  for (const field of ['thumbnailUrl', 'category', 'transcriptUrl', 'sourceUrl'] as const) {
    if (!updated[field] && field in input) toClear.push(field)
  }

  await redis.hset(episodeKey(id), fields)
  if (toClear.length > 0) {
    await redis.hdel(episodeKey(id), ...toClear)
  }
  return updated
}

export async function deleteEpisode(id: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) throw new Error('Storage is not configured')

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

/** Distinct show names, most-recent-first, for the archive filter. */
export async function getAllShows(): Promise<string[]> {
  const episodes = await getAllEpisodes()
  const seen = new Set<string>()
  for (const ep of episodes) {
    if (ep.showName) seen.add(ep.showName)
  }
  return Array.from(seen).sort()
}
