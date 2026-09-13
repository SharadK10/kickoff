import type { Order, Speed } from '../../types/content'
import { PauseControl } from './PauseControl'
import { SpeedControl } from './SpeedControl'

const SEGMENT =
  'rounded-full px-3 py-1.5 text-sm transition-colors aria-pressed:bg-ink aria-pressed:text-surface text-ink-muted hover:text-ink'

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
      <SpeedControl speeds={speeds} speed={speed} onSpeed={onSpeed} />

      <div className="flex items-center gap-1" role="group" aria-label="Order">
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
      </div>

      <PauseControl isPaused={isPaused} onTogglePause={onTogglePause} />
    </div>
  )
}
