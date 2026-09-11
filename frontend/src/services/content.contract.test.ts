import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Kickoff, KickoffSummary } from '../types/content'

function readContent<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(import.meta.dirname, '../../public/content', file), 'utf8')) as T
}

describe('shelf index', () => {
  it('lists piano as a live kickoff', () => {
    const shelf = readContent<KickoffSummary[]>('index.json')
    expect(shelf).toHaveLength(1)
    expect(shelf[0]).toMatchObject({ slug: 'piano', title: 'Piano', category: 'Music', status: 'LIVE' })
    expect(shelf[0].accent).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('piano kickoff', () => {
  const piano = readContent<Kickoff>('piano.json')

  it('has the identity the shelf promises', () => {
    expect(piano.slug).toBe('piano')
    expect(piano.exerciseNumber).toBe('01')
    expect(piano.exerciseTitle).toBe('Find your hand position')
  })

  it('only uses block types that piano or core will register', () => {
    const known = new Set(['PROSE', 'KEY_IDEA', 'KEYBOARD', 'HAND_RULE'])
    for (const block of piano.idea) {
      expect(known.has(block.type)).toBe(true)
    }
  })

  it('teaches with at least one keyboard diagram and the hand rule', () => {
    const types = piano.idea.map((block) => block.type)
    expect(types).toContain('KEYBOARD')
    expect(types).toContain('HAND_RULE')
    expect(types.filter((t) => t === 'KEY_IDEA')).toHaveLength(2)
  })

  it('configures the playground with the seven white keys', () => {
    expect(piano.playground.promptType).toBe('NOTE_LETTER')
    expect(piano.playground.items).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(piano.playground.order).toBe('RANDOM')
  })

  it('offers exactly the three agreed speeds and defaults to the slowest', () => {
    expect(piano.playground.speeds).toEqual([
      { label: 'Unhurried', ms: 8000 },
      { label: 'Steady', ms: 5000 },
      { label: 'Brisk', ms: 3000 },
    ])
    expect(piano.playground.defaultSpeedLabel).toBe('Unhurried')
  })

  it('names three things that come next', () => {
    expect(piano.whatsNext).toHaveLength(3)
    for (const item of piano.whatsNext) {
      expect(item.number).toMatch(/^0[2-4]$/)
      expect(item.title.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
    }
  })

  it('never mentions sharps or flats', () => {
    const text = JSON.stringify(piano)
    expect(text).not.toMatch(/\b(sharp|sharps|flat|flats)\b/i)
  })
})
