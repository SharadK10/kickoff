import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Order, PlaygroundConfig, Speed } from '../../types/content'
import { nextIndex } from './nextIndex'

export type PlaygroundController = {
  current: string
  index: number
  isPaused: boolean
  speed: Speed
  speeds: Speed[]
  order: Order
  togglePause: () => void
  chooseSpeed: (label: string) => void
  chooseOrder: (order: Order) => void
}

/**
 * Runs a playground: a timer, an order, and a pause. It knows nothing about
 * what the items mean — they are opaque strings supplied by a kickoff.
 */
export function usePlayground(config: PlaygroundConfig): PlaygroundController {
  const defaultSpeed = useMemo(
    () => config.speeds.find((candidate) => candidate.label === config.defaultSpeedLabel) ?? config.speeds[0],
    [config.speeds, config.defaultSpeedLabel],
  )

  const [speed, setSpeed] = useState<Speed>(defaultSpeed)
  const [order, setOrder] = useState<Order>(config.order)
  const [isPaused, setIsPaused] = useState(false)
  const [index, setIndex] = useState(0)

  const itemCount = config.items.length

  useEffect(() => {
    if (isPaused || itemCount === 0) return
    const timer = window.setInterval(() => {
      setIndex((current) => nextIndex(itemCount, current, order))
    }, speed.ms)
    return () => window.clearInterval(timer)
  }, [isPaused, itemCount, order, speed.ms])

  const togglePause = useCallback(() => setIsPaused((paused) => !paused), [])

  const chooseSpeed = useCallback(
    (label: string) => {
      const found = config.speeds.find((candidate) => candidate.label === label)
      if (found) setSpeed(found)
    },
    [config.speeds],
  )

  const chooseOrder = useCallback((next: Order) => setOrder(next), [])

  return {
    current: config.items[index] ?? '',
    index,
    isPaused,
    speed,
    speeds: config.speeds,
    order,
    togglePause,
    chooseSpeed,
    chooseOrder,
  }
}
