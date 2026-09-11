import type { Order } from '../../types/content'

/**
 * Chooses the next prompt index.
 *
 * RANDOM picks an offset of 1..n-1 rather than an absolute index, which
 * guarantees the same prompt never appears twice in a row and — unlike a
 * retry loop — always terminates.
 */
export function nextIndex(
  itemCount: number,
  currentIndex: number,
  order: Order,
  random: () => number = Math.random,
): number {
  if (itemCount <= 1) return 0
  if (order === 'SEQUENTIAL') return (currentIndex + 1) % itemCount
  const offset = 1 + Math.floor(random() * (itemCount - 1))
  return (currentIndex + offset) % itemCount
}
