import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadKickoff, loadShelf } from './contentSource'

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadShelf', () => {
  it('fetches the shelf index', async () => {
    const fetchMock = mockFetch(200, [{ slug: 'piano' }])
    const shelf = await loadShelf()
    expect(fetchMock).toHaveBeenCalledWith('/content/index.json')
    expect(shelf).toEqual([{ slug: 'piano' }])
  })

  it('throws a readable error when the shelf is missing', async () => {
    mockFetch(404, null)
    await expect(loadShelf()).rejects.toThrow('Could not load /content/index.json (404)')
  })
})

describe('loadKickoff', () => {
  it('fetches a kickoff by slug', async () => {
    const fetchMock = mockFetch(200, { slug: 'piano', title: 'Piano' })
    const kickoff = await loadKickoff('piano')
    expect(fetchMock).toHaveBeenCalledWith('/content/piano.json')
    expect(kickoff.title).toBe('Piano')
  })

  it('throws a readable error for an unknown slug', async () => {
    mockFetch(404, null)
    await expect(loadKickoff('banjo')).rejects.toThrow('Could not load /content/banjo.json (404)')
  })
})
