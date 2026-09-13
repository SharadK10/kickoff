import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { nextIndex } from '../../core/playground/nextIndex'
import { PauseControl } from '../../core/playground/PauseControl'
import { SpeedControl } from '../../core/playground/SpeedControl'
import { TimingLine } from '../../core/playground/TimingLine'
import { usePlaygroundTimer } from '../../core/playground/usePlaygroundTimer'
import { useSpacebarPause } from '../../core/playground/useSpacebarPause'
import { useWakeLock } from '../../core/playground/useWakeLock'
import type { Speed } from '../../types/content'
import { allScaleSteps, scaleSteps } from './scaleDrill'

type Mode = 'STAY' | 'IN_ORDER'

const SEGMENT =
  'rounded-full px-3 py-1.5 text-sm transition-colors aria-pressed:bg-ink aria-pressed:text-surface text-ink-muted hover:text-ink'

function readScales(config: Record<string, unknown>): string[] {
  return Array.isArray(config.scales) ? (config.scales as string[]) : []
}

function readSpeeds(config: Record<string, unknown>): Speed[] {
  return Array.isArray(config.speeds) ? (config.speeds as Speed[]) : []
}

export function ScaleDrillPlayground({ config }: { config: Record<string, unknown> }) {
  const scales = readScales(config)
  const speeds = readSpeeds(config)
  const defaultSpeedLabel = typeof config.defaultSpeedLabel === 'string' ? config.defaultSpeedLabel : undefined
  const instruction = typeof config.instruction === 'string' ? config.instruction : ''

  const defaultSpeed = useMemo(
    () => speeds.find((candidate) => candidate.label === defaultSpeedLabel) ?? speeds[0],
    [speeds, defaultSpeedLabel],
  )

  const [mode, setMode] = useState<Mode>('IN_ORDER')
  const [selectedScale, setSelectedScale] = useState<string>(scales[0] ?? '')
  const [speed, setSpeed] = useState<Speed | undefined>(defaultSpeed)
  const [isPaused, setIsPaused] = useState(false)
  const [index, setIndex] = useState(0)

  const steps = useMemo(
    () => (mode === 'STAY' ? scaleSteps(selectedScale) : allScaleSteps(scales)),
    [mode, selectedScale, scales],
  )

  const itemCount = steps.length

  const onTick = useCallback(() => {
    setIndex((current) => nextIndex(itemCount, current, 'SEQUENTIAL'))
  }, [itemCount])

  usePlaygroundTimer({ isPaused: isPaused || itemCount === 0, speedMs: speed?.ms ?? 0, onTick })

  const togglePause = useCallback(() => setIsPaused((paused) => !paused), [])
  useSpacebarPause(togglePause)
  useWakeLock()

  const chooseMode = useCallback((next: Mode) => {
    setMode(next)
    setIndex(0)
  }, [])

  const chooseScale = useCallback((next: string) => {
    setSelectedScale(next)
    setIndex(0)
  }, [])

  const chooseSpeed = useCallback(
    (label: string) => {
      const found = speeds.find((candidate) => candidate.label === label)
      if (found) setSpeed(found)
    },
    [speeds],
  )

  if (!speed || itemCount === 0) return null

  const current = steps[index]

  return (
    <div className="flex flex-col items-center gap-10">
      <p className="max-w-[36ch] text-center text-base text-ink-muted">{instruction}</p>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex h-48 flex-col items-center justify-center gap-2 sm:h-64"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">Scale of {current.scale}</span>
            <span className="font-display text-[7rem] leading-none text-ink sm:text-[11rem]">{current.note}</span>
            <span className="text-sm text-ink-muted">
              right {current.rightFinger} · left {current.leftFinger}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <TimingLine durationMs={speed.ms} isPaused={isPaused} restartKey={`${index}-${speed.ms}`} />

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <SpeedControl speeds={speeds} speed={speed} onSpeed={chooseSpeed} />

        <div className="flex items-center gap-1" role="group" aria-label="Mode">
          <button type="button" className={SEGMENT} aria-pressed={mode === 'STAY'} onClick={() => chooseMode('STAY')}>
            Stay
          </button>
          <button
            type="button"
            className={SEGMENT}
            aria-pressed={mode === 'IN_ORDER'}
            onClick={() => chooseMode('IN_ORDER')}
          >
            In order
          </button>
        </div>

        <PauseControl isPaused={isPaused} onTogglePause={togglePause} />
      </div>

      {mode === 'STAY' ? (
        <div className="flex items-center gap-1" role="group" aria-label="Scale">
          {scales.map((scale) => (
            <button
              key={scale}
              type="button"
              className={SEGMENT}
              aria-pressed={scale === selectedScale}
              onClick={() => chooseScale(scale)}
            >
              {scale}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
