import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaygroundConfig } from '../../types/content'
import { usePlayground } from './usePlayground'

const config: PlaygroundConfig = {
  promptType: 'TEST_PROMPT',
  items: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  order: 'SEQUENTIAL',
  speeds: [
    { label: 'Unhurried', ms: 8000 },
    { label: 'Steady', ms: 5000 },
    { label: 'Brisk', ms: 3000 },
  ],
  defaultSpeedLabel: 'Unhurried',
  instruction: 'do the thing',
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePlayground', () => {
  it('starts on the first item at the configured default speed', () => {
    const { result } = renderHook(() => usePlayground(config))
    expect(result.current.current).toBe('C')
    expect(result.current.speed.label).toBe('Unhurried')
    expect(result.current.isPaused).toBe(false)
  })

  it('falls back to the first speed when the default label is unknown', () => {
    const { result } = renderHook(() => usePlayground({ ...config, defaultSpeedLabel: 'Sluggish' }))
    expect(result.current.speed.label).toBe('Unhurried')
  })

  it('advances once the speed interval elapses', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('D')
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('E')
  })

  it('does not advance before the interval elapses', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { vi.advanceTimersByTime(7999) })
    expect(result.current.current).toBe('C')
  })

  it('stops advancing while paused and resumes afterwards', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.togglePause() })
    expect(result.current.isPaused).toBe(true)
    act(() => { vi.advanceTimersByTime(40000) })
    expect(result.current.current).toBe('C')

    act(() => { result.current.togglePause() })
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('D')
  })

  it('uses the new interval after the speed changes', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.chooseSpeed('Brisk') })
    expect(result.current.speed.ms).toBe(3000)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.current).toBe('D')
  })

  it('ignores an unknown speed label', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.chooseSpeed('Warp') })
    expect(result.current.speed.label).toBe('Unhurried')
  })

  it('never repeats the current item in RANDOM order', () => {
    const { result } = renderHook(() => usePlayground({ ...config, order: 'RANDOM' }))
    let previous = result.current.current
    for (let step = 0; step < 30; step += 1) {
      act(() => { vi.advanceTimersByTime(8000) })
      expect(result.current.current).not.toBe(previous)
      previous = result.current.current
    }
  })

  it('switches order on demand', () => {
    const { result } = renderHook(() => usePlayground({ ...config, order: 'RANDOM' }))
    act(() => { result.current.chooseOrder('SEQUENTIAL') })
    expect(result.current.order).toBe('SEQUENTIAL')
    const startIndex = result.current.index
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.index).toBe((startIndex + 1) % config.items.length)
  })
})
