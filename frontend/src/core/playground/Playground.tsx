import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import type { PlaygroundConfig } from '../../types/content'
import { PlaygroundControls } from './PlaygroundControls'
import { TimingLine } from './TimingLine'
import { getPromptComponent } from './promptRegistry'
import { usePlayground } from './usePlayground'

const IGNORE_SPACE_ON = new Set(['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A'])

export function Playground({ config }: { config: PlaygroundConfig }) {
  const playground = usePlayground(config)
  const Prompt = getPromptComponent(config.promptType)
  const { togglePause } = playground

  if (!Prompt) {
    console.warn(`Kick Off: no renderer registered for prompt type "${config.promptType}"`)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space') return
      const target = event.target as HTMLElement | null
      // A focused button already handles space as a click; let it, or we toggle twice.
      if (target && (IGNORE_SPACE_ON.has(target.tagName) || target.isContentEditable)) return
      event.preventDefault()
      togglePause()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause])

  return (
    <div className="flex flex-col items-center gap-10">
      <p className="max-w-[36ch] text-center text-base text-ink-muted">{config.instruction}</p>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex h-48 items-center justify-center sm:h-64"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={playground.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {Prompt ? <Prompt prompt={playground.current} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <TimingLine
        durationMs={playground.speed.ms}
        isPaused={playground.isPaused}
        restartKey={`${playground.index}-${playground.speed.ms}`}
      />

      <PlaygroundControls
        speeds={playground.speeds}
        speed={playground.speed}
        onSpeed={playground.chooseSpeed}
        order={playground.order}
        onOrder={playground.chooseOrder}
        isPaused={playground.isPaused}
        onTogglePause={playground.togglePause}
      />
    </div>
  )
}
