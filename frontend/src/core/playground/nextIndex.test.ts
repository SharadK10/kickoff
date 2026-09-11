import { describe, expect, it } from 'vitest'
import { nextIndex } from './nextIndex'

describe('nextIndex in SEQUENTIAL order', () => {
  it('walks forward one at a time', () => {
    expect(nextIndex(7, 0, 'SEQUENTIAL')).toBe(1)
    expect(nextIndex(7, 3, 'SEQUENTIAL')).toBe(4)
  })

  it('wraps around at the end', () => {
    expect(nextIndex(7, 6, 'SEQUENTIAL')).toBe(0)
  })
})

describe('nextIndex in RANDOM order', () => {
  it('never returns the current index, whatever the random value', () => {
    for (const value of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999999]) {
      for (let current = 0; current < 7; current += 1) {
        expect(nextIndex(7, current, 'RANDOM', () => value)).not.toBe(current)
      }
    }
  })

  it('maps the lowest random value to the next item', () => {
    expect(nextIndex(7, 2, 'RANDOM', () => 0)).toBe(3)
  })

  it('maps the highest random value to the previous item', () => {
    expect(nextIndex(7, 2, 'RANDOM', () => 0.999999)).toBe(1)
  })

  it('can reach every other index', () => {
    const reached = new Set<number>()
    for (let step = 0; step < 6; step += 1) {
      reached.add(nextIndex(7, 0, 'RANDOM', () => step / 6))
    }
    expect([...reached].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('nextIndex edge cases', () => {
  it('stays at 0 for a single item', () => {
    expect(nextIndex(1, 0, 'RANDOM')).toBe(0)
    expect(nextIndex(1, 0, 'SEQUENTIAL')).toBe(0)
  })

  it('stays at 0 for an empty list', () => {
    expect(nextIndex(0, 0, 'RANDOM')).toBe(0)
  })
})
