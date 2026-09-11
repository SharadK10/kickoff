/**
 * Shows when the prompt will change. A CSS animation rather than a JS one so
 * that pausing is a single property change and stays in step with the timer.
 * This indicates timing, not achievement — it is the only meter in Kick Off.
 */
export function TimingLine({
  durationMs,
  isPaused,
  restartKey,
}: {
  durationMs: number
  isPaused: boolean
  restartKey: string
}) {
  return (
    <div className="h-px w-full max-w-[18rem] overflow-hidden bg-line" aria-hidden="true">
      <div
        key={restartKey}
        className="h-full w-full origin-left bg-accent/50 [animation-fill-mode:forwards] [animation-name:kickoff-timing] [animation-timing-function:linear]"
        style={{
          animationDuration: `${durationMs}ms`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />
    </div>
  )
}
