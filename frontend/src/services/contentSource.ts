import type { Kickoff, KickoffSummary } from '../types/content'

/**
 * The single seam between Kick Off and wherever content lives.
 * Today that is static JSON in `public/content`. If a backend is ever needed,
 * only BASE and the two paths below change — nothing else in the app moves.
 */
const BASE = '/content'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`)
  }
  return (await response.json()) as T
}

export function loadShelf(): Promise<KickoffSummary[]> {
  return getJson<KickoffSummary[]>(`${BASE}/index.json`)
}

export function loadKickoff(slug: string): Promise<Kickoff> {
  return getJson<Kickoff>(`${BASE}/${slug}.json`)
}
