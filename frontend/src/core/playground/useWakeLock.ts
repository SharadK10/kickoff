import { useEffect } from 'react'

/**
 * Keeps the screen awake while mounted — the learner is using their hands on
 * a real instrument, not touching the screen, so it must not sleep or dim.
 * Feature-detected: silently does nothing on browsers without Wake Lock
 * support, and re-acquires the lock if the tab is backgrounded and returns,
 * since browsers release it automatically when a tab goes out of view.
 */
export function useWakeLock(): void {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          await lock.release()
          return
        }
        sentinel = lock
      } catch {
        // Refused (e.g. low battery, hidden tab) — nothing to fall back to.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && !sentinel) {
        void acquire()
      }
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release()
    }
  }, [])
}
