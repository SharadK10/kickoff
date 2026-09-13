import { useCallback, useMemo, useState } from 'react'
import type { Order, PlaygroundConfig, PlaygroundItem, Speed } from '../../types/content'
import { nextIndex } from './nextIndex'
import { usePlaygroundTimer } from './usePlaygroundTimer'

export type PlaygroundController = {
  current: PlaygroundItem
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
 * what the items mean — they are opaque objects supplied by a kickoff.
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

  const onTick = useCallback(() => {
    setIndex((current) => nextIndex(itemCount, current, order))
  }, [itemCount, order])

  usePlaygroundTimer({ isPaused: isPaused || itemCount === 0, speedMs: speed.ms, onTick })

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
    current: config.items[index] ?? {},
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
