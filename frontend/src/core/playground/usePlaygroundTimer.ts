import { useEffect } from 'react'

/**
 * Calls `onTick` every `speedMs` while not paused. Purely mechanical — the
 * caller owns what a tick means (advancing an index, for instance).
 *
 * `onTick` must be stable across renders where the interval shouldn't
 * restart — wrap it in `useCallback` with only the dependencies that should
 * actually cause a restart (e.g. item count, order), the same way the
 * original single-purpose timer effect did.
 */
export function usePlaygroundTimer({
  isPaused,
  speedMs,
  onTick,
}: {
  isPaused: boolean
  speedMs: number
  onTick: () => void
}): void {
  useEffect(() => {
    if (isPaused) return
    const timer = window.setInterval(onTick, speedMs)
    return () => window.clearInterval(timer)
  }, [isPaused, speedMs, onTick])
}
