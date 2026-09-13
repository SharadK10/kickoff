export function PauseControl({ isPaused, onTogglePause }: { isPaused: boolean; onTogglePause: () => void }) {
  return (
    <button
      type="button"
      onClick={onTogglePause}
      className="rounded-full border border-line px-5 py-1.5 text-sm text-ink transition-colors hover:bg-surface-raised"
    >
      {isPaused ? 'Resume' : 'Pause'}
      <span className="ml-2 text-ink-faint">space</span>
    </button>
  )
}
