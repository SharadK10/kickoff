import type { Order, Speed } from '../../types/content'

const SEGMENT =
  'rounded-full px-3 py-1.5 text-sm transition-colors aria-pressed:bg-ink aria-pressed:text-surface text-ink-muted hover:text-ink'

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {children}
    </div>
  )
}

export function PlaygroundControls({
  speeds,
  speed,
  onSpeed,
  order,
  onOrder,
  isPaused,
  onTogglePause,
}: {
  speeds: Speed[]
  speed: Speed
  onSpeed: (label: string) => void
  order: Order
  onOrder: (order: Order) => void
  isPaused: boolean
  onTogglePause: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <Group label="Speed">
        {speeds.map((candidate) => (
          <button
            key={candidate.label}
            type="button"
            className={SEGMENT}
            aria-pressed={candidate.label === speed.label}
            onClick={() => onSpeed(candidate.label)}
          >
            {candidate.label}
          </button>
        ))}
      </Group>

      <Group label="Order">
        <button type="button" className={SEGMENT} aria-pressed={order === 'RANDOM'} onClick={() => onOrder('RANDOM')}>
          Shuffled
        </button>
        <button
          type="button"
          className={SEGMENT}
          aria-pressed={order === 'SEQUENTIAL'}
          onClick={() => onOrder('SEQUENTIAL')}
        >
          In order
        </button>
      </Group>

      <button
        type="button"
        onClick={onTogglePause}
        className="rounded-full border border-line px-5 py-1.5 text-sm text-ink transition-colors hover:bg-surface-raised"
      >
        {isPaused ? 'Resume' : 'Pause'}
        <span className="ml-2 text-ink-faint">space</span>
      </button>
    </div>
  )
}
