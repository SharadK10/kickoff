import type { Speed } from '../../types/content'

const SEGMENT =
  'rounded-full px-3 py-1.5 text-sm transition-colors aria-pressed:bg-ink aria-pressed:text-surface text-ink-muted hover:text-ink'

export function SpeedControl({
  speeds,
  speed,
  onSpeed,
}: {
  speeds: Speed[]
  speed: Speed
  onSpeed: (label: string) => void
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Speed">
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
    </div>
  )
}
