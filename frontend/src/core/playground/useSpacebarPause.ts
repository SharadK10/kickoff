import { useEffect } from 'react'

const IGNORE_SPACE_ON = new Set(['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A'])

/**
 * Spacebar toggles pause, except when a focused control already handles
 * Space as a click (a focused button, say) — otherwise it would toggle
 * twice: once from the button's native click, once from this listener.
 */
export function useSpacebarPause(togglePause: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space') return
      const target = event.target as HTMLElement | null
      if (target && (IGNORE_SPACE_ON.has(target.tagName) || target.isContentEditable)) return
      event.preventDefault()
      togglePause()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause])
}
