# Piano Multi-Exercise Kickoffs & Five-Finger Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Piano from a single-exercise kickoff into a hub with multiple exercise pages, migrate Exercise 01 into that shape unchanged in behavior, and add Exercise 02 — a timed, up-and-down five-finger scale drill across four starting notes.

**Architecture:** `Kickoff` becomes a hub (identity + an ordered list of `Exercise` entries, each `LIVE` or `COMING_SOON`); each `LIVE` exercise gets its own route. The playground engine splits into universal core primitives (timer, spacebar-pause, wake lock, speed control, pause control) that any exercise composes, plus per-exercise sequencing/controls that core never inspects — extending the existing block/prompt registry pattern with a third registry, for playground *types* themselves, so an exercise route can render either the existing generic declarative playground or a bespoke one without core knowing which.

**Tech Stack:** Same as the existing project — React 19.3, TypeScript 5.9, Vite 8.3, React Router 7.18, Tailwind CSS 4.3, Motion 13.2. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-13-piano-five-finger-scale-design.md` (and, for unchanged platform philosophy, `docs/superpowers/specs/2026-09-12-kick-off-piano.md`)

## Global Constraints

- **No automated tests, no per-task code review.** Per the project's ruling on 2026-09-12 (carried into this spec's §8): verification is `npm run build` (TypeScript must type-check cleanly) plus a manual walkthrough of the running app via `npm run dev`. Every task ends with both, not with a test suite.
- **No backend.** Content is still static JSON in `frontend/public/content/`, loaded via `contentSource.ts`, which does not change in this plan.
- **Core must never contain the literal strings** `piano`, `scale`, `finger`, `octave`, `note`, or `keyboard` outside `frontend/src/kickoffs/`. This extends the existing constraint from the previous plan to cover the new vocabulary this feature introduces.
- **Exact values, copied from the spec:**
  - Five-finger-scale step pattern, right-hand fingers: `[1, 2, 3, 4, 5, 5, 4, 3, 2, 1]`. Left-hand fingers: `[5, 4, 3, 2, 1, 1, 2, 3, 4, 5]`. 10 steps per scale.
  - The four scales, in this order: `C, G, A, F`.
  - Exercise 02 speeds: **Unhurried 1500ms (default) · Steady 1000ms · Brisk 600ms** — same three labels used elsewhere, new numeric values.
  - Default mode: **In order**. Default selected scale (used only if Stay is chosen): **C**.
  - Switching modes, or switching the selected scale while in Stay mode, always resets the current step to index 0.
  - Piano's exercise list, in final order: `01 hand-position (LIVE)`, `02 five-finger-scale (LIVE, new)`, `03 name-the-note (COMING_SOON)`, `04 keep-time (COMING_SOON)`, `05 first-chord (COMING_SOON)`.
- **No new block types.** Exercise 02's primer reuses the existing `PROSE`, `KEY_IDEA`, and `HAND_RULE` blocks.
- **Commit after every task.** Conventional commit messages.

---

## File Structure

```
frontend/
├── public/content/
│   └── piano.json                        restructured: hub fields + exercises[]
└── src/
    ├── types/content.ts                  Exercise type added; Kickoff restructured; PlaygroundItem added
    ├── core/
    │   ├── playground/
    │   │   ├── usePlaygroundTimer.ts      NEW — the bare interval-on-a-timer primitive
    │   │   ├── useSpacebarPause.ts        NEW — extracted from Playground.tsx
    │   │   ├── useWakeLock.ts             NEW — Screen Wake Lock, feature-detected
    │   │   ├── SpeedControl.tsx           NEW — extracted from PlaygroundControls.tsx
    │   │   ├── PauseControl.tsx           NEW — extracted from PlaygroundControls.tsx
    │   │   ├── playgroundRegistry.ts      NEW — third registry, parallel to blocks/prompts
    │   │   ├── PlaygroundHost.tsx         NEW — looks up a playground type, renders it
    │   │   ├── index.tsx                  NEW — registers "GENERIC" → the existing <Playground>
    │   │   ├── usePlayground.ts           MODIFY — rebuilt on usePlaygroundTimer; items widen to PlaygroundItem[]
    │   │   ├── Playground.tsx             MODIFY — uses useSpacebarPause + useWakeLock; prompt gets `item` not `prompt`
    │   │   ├── PlaygroundControls.tsx     MODIFY — composed from SpeedControl + PauseControl
    │   │   ├── promptRegistry.ts          MODIFY — PromptComponent takes `{ item: PlaygroundItem }`
    │   │   ├── nextIndex.ts               unchanged
    │   │   └── TimingLine.tsx             unchanged
    │   └── ...                            (blocks/, shell/, theme/, ui/ — all unchanged)
    ├── main.tsx                           MODIFY — comment only, now also mentions playground types
    ├── kickoffs/
    │   ├── index.ts                       MODIFY — also imports '../core/playground'
    │   └── piano/
    │       ├── scaleDrill.ts              NEW — pure five-finger-scale step sequence logic
    │       ├── ScaleDrillPlayground.tsx   NEW — Exercise 02's bespoke playground
    │       ├── NoteLetterPrompt.tsx       MODIFY — reads `item.note` instead of a bare `prompt` string
    │       ├── index.ts                   MODIFY — registers ScaleDrillPlayground as "SCALE_DRILL"
    │       └── handPosition.ts            unchanged (reused by scaleDrill.ts)
    └── app/
        ├── router.tsx                     MODIFY — adds the `/:slug/:exerciseSlug` route
        └── routes/
            ├── KickoffRoute.tsx           MODIFY — becomes the hub (exercise list), not a single exercise page
            ├── ExerciseRoute.tsx          NEW — one exercise's Idea + Playground
            └── RouteError.tsx             unchanged
```

---

## Task 1: Content types

**Files:**
- Modify: `frontend/src/types/content.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PlaygroundItem = Record<string, unknown>`; `PlaygroundConfig.items: PlaygroundItem[]` (was `string[]`); `Exercise` type; restructured `Kickoff` type (`closing`, `exercises: Exercise[]` — no more `exerciseNumber`/`exerciseTitle`/`idea`/`playground`/`whatsNext`); `NextItem` removed.

- [ ] **Step 1: Rewrite `frontend/src/types/content.ts` in full**

```ts
/** A unit of primer content. `type` is opaque to core — a kickoff registers a renderer for it. */
export type Block = { type: string } & Record<string, unknown>

export type Speed = { label: string; ms: number }

export type Order = 'RANDOM' | 'SEQUENTIAL'

/** One item in a playground's sequence. Opaque to core — the registered prompt component interprets it. */
export type PlaygroundItem = Record<string, unknown>

export type PlaygroundConfig = {
  /** Opaque to core. A kickoff registers a prompt renderer for this string. */
  promptType: string
  items: PlaygroundItem[]
  order: Order
  speeds: Speed[]
  defaultSpeedLabel: string
  instruction: string
}

export type KickoffSummary = {
  slug: string
  title: string
  tagline: string
  category: string
  /** CSS colour; becomes --color-accent for this kickoff's page. */
  accent: string
  status: 'LIVE' | 'COMING_SOON'
}

export type Exercise = {
  slug: string
  number: string
  title: string
  status: 'LIVE' | 'COMING_SOON'
  /** Shown on the hub for COMING_SOON entries; optional for LIVE ones, which speak for themselves via their own page. */
  description?: string
  /** Present only when LIVE. */
  idea?: Block[]
  /** Opaque to core. Selects which registered playground component renders `playground`. Present only when LIVE. */
  playgroundType?: string
  /** Opaque to core — shape is owned by whichever component `playgroundType` selects. Present only when LIVE. */
  playground?: Record<string, unknown>
}

export type Kickoff = KickoffSummary & {
  /** A closing line shown once, below the exercise list. Kickoff-specific copy, owned by content. */
  closing: string
  exercises: Exercise[]
}
```

- [ ] **Step 2: Verify the build**

Node 24 must be active: `source ~/.nvm/nvm.sh && nvm use 24` (or prepend `$HOME/.nvm/versions/node/v24.21.0/bin` to `PATH`).

Run: `cd frontend && npm run build`
Expected: **fails** — this is expected and fine. Every file that referenced the old `Kickoff`/`PlaygroundConfig` shape (`KickoffRoute.tsx`, `usePlayground.ts`, `Playground.tsx`, `promptRegistry.ts`, `NoteLetterPrompt.tsx`, `piano.json`'s runtime shape) is now out of sync with the new types. That's expected — later tasks fix each of them in turn. Do not attempt to fix every error now; that is the rest of this plan.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
git add frontend/src/types/content.ts
git commit -m "feat: restructure content types for multi-exercise kickoffs"
```

---

## Task 2: Playground primitives

**Files:**
- Create: `frontend/src/core/playground/usePlaygroundTimer.ts`, `frontend/src/core/playground/useSpacebarPause.ts`, `frontend/src/core/playground/useWakeLock.ts`, `frontend/src/core/playground/SpeedControl.tsx`, `frontend/src/core/playground/PauseControl.tsx`

**Interfaces:**
- Consumes: `Speed` from `src/types/content.ts` (Task 1).
- Produces: `usePlaygroundTimer({ isPaused, speedMs, onTick }): void`; `useSpacebarPause(togglePause: () => void): void`; `useWakeLock(): void`; `<SpeedControl speeds={Speed[]} speed={Speed} onSpeed={(label: string) => void} />`; `<PauseControl isPaused={boolean} onTogglePause={() => void} />`.

These are new, additive files — nothing in the app uses them yet, so this task cannot be manually verified end-to-end on its own. Verification is the build passing and a careful read against the code below; Task 3 wires them in and is where their behavior becomes observable.

- [ ] **Step 1: Write `frontend/src/core/playground/usePlaygroundTimer.ts`**

```ts
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
```

- [ ] **Step 2: Write `frontend/src/core/playground/useSpacebarPause.ts`**

```ts
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
```

- [ ] **Step 3: Write `frontend/src/core/playground/useWakeLock.ts`**

```ts
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
```

If TypeScript reports that `navigator.wakeLock` or `WakeLockSentinel` don't exist, `typescript@5.9.3`'s DOM lib should already include them (added well before this version) — double-check `tsconfig.app.json`'s `"lib"` array includes `"DOM"` (it does, from the original scaffold) before reaching for a type assertion; this should just compile.

- [ ] **Step 4: Write `frontend/src/core/playground/SpeedControl.tsx`**

```tsx
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
```

- [ ] **Step 5: Write `frontend/src/core/playground/PauseControl.tsx`**

```tsx
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
```

- [ ] **Step 6: Verify the build**

Run: `cd frontend && npm run build`
Expected: still fails, for the same reasons as Task 1 (nothing has consumed these new files yet, and the old `usePlayground.ts`/`Playground.tsx`/`PlaygroundControls.tsx`/`promptRegistry.ts`/`NoteLetterPrompt.tsx` still reference the pre-Task-1 shapes). Confirm the errors are *only* in those five files and `piano.json`'s runtime shape — not in any file this task created.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/core/playground/usePlaygroundTimer.ts frontend/src/core/playground/useSpacebarPause.ts frontend/src/core/playground/useWakeLock.ts frontend/src/core/playground/SpeedControl.tsx frontend/src/core/playground/PauseControl.tsx
git commit -m "feat: extract shared playground primitives (timer, spacebar pause, wake lock, speed/pause controls)"
```

---
## Task 3: Rewire the generic playground onto the shared primitives

**Files:**
- Modify: `frontend/src/core/playground/usePlayground.ts`, `frontend/src/core/playground/Playground.tsx`, `frontend/src/core/playground/PlaygroundControls.tsx`, `frontend/src/core/playground/promptRegistry.ts`, `frontend/src/kickoffs/piano/NoteLetterPrompt.tsx`, `frontend/public/content/piano.json`

**Interfaces:**
- Consumes: `usePlaygroundTimer`, `useSpacebarPause`, `useWakeLock`, `SpeedControl`, `PauseControl` (Task 2); `PlaygroundItem` (Task 1).
- Produces: `PlaygroundController.current: PlaygroundItem` (was `string`); `PromptComponent = ComponentType<{ item: PlaygroundItem }>` (was `{ prompt: string }`). Both are consumed by `ScaleDrillPlayground` (Task 5) only insofar as it reuses the same `PlaygroundItem` type — it does not use `usePlayground`/`Playground` itself.

This task's job is a pure refactor: after it, Exercise 01 behaves exactly as it did before, just built on the shared primitives and with items shaped as objects instead of bare strings.

- [ ] **Step 1: Rewrite `frontend/src/core/playground/usePlayground.ts`**

```ts
import { useCallback, useMemo, useState } from 'react'
import type { Order, PlaygroundConfig, PlaygroundItem, Speed } from '../../types/content'
import { nextIndex } from './nextIndex'
import { usePlaygroundTimer } from './usePlaygroundTimer'

export type PlaygroundController = {
  current: PlaygroundItem
  index: number
  isPaused: boolean
  speed: Speed
  speeds: Speed[]
  order: Order
  togglePause: () => void
  chooseSpeed: (label: string) => void
  chooseOrder: (order: Order) => void
}

/**
 * Runs a playground: a timer, an order, and a pause. It knows nothing about
 * what the items mean — they are opaque objects supplied by a kickoff.
 */
export function usePlayground(config: PlaygroundConfig): PlaygroundController {
  const defaultSpeed = useMemo(
    () => config.speeds.find((candidate) => candidate.label === config.defaultSpeedLabel) ?? config.speeds[0],
    [config.speeds, config.defaultSpeedLabel],
  )

  const [speed, setSpeed] = useState<Speed>(defaultSpeed)
  const [order, setOrder] = useState<Order>(config.order)
  const [isPaused, setIsPaused] = useState(false)
  const [index, setIndex] = useState(0)

  const itemCount = config.items.length

  const onTick = useCallback(() => {
    setIndex((current) => nextIndex(itemCount, current, order))
  }, [itemCount, order])

  usePlaygroundTimer({ isPaused: isPaused || itemCount === 0, speedMs: speed.ms, onTick })

  const togglePause = useCallback(() => setIsPaused((paused) => !paused), [])

  const chooseSpeed = useCallback(
    (label: string) => {
      const found = config.speeds.find((candidate) => candidate.label === label)
      if (found) setSpeed(found)
    },
    [config.speeds],
  )

  const chooseOrder = useCallback((next: Order) => setOrder(next), [])

  return {
    current: config.items[index] ?? {},
    index,
    isPaused,
    speed,
    speeds: config.speeds,
    order,
    togglePause,
    chooseSpeed,
    chooseOrder,
  }
}
```

- [ ] **Step 2: Rewrite `frontend/src/core/playground/Playground.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react'
import type { PlaygroundConfig } from '../../types/content'
import { PlaygroundControls } from './PlaygroundControls'
import { TimingLine } from './TimingLine'
import { getPromptComponent } from './promptRegistry'
import { usePlayground } from './usePlayground'
import { useSpacebarPause } from './useSpacebarPause'
import { useWakeLock } from './useWakeLock'

export function Playground({ config }: { config: PlaygroundConfig }) {
  const playground = usePlayground(config)
  const Prompt = getPromptComponent(config.promptType)

  useSpacebarPause(playground.togglePause)
  useWakeLock()

  if (!Prompt) {
    console.warn(`Kick Off: no renderer registered for prompt type "${config.promptType}"`)
  }

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
            {Prompt ? <Prompt item={playground.current} /> : null}
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
```

- [ ] **Step 3: Rewrite `frontend/src/core/playground/PlaygroundControls.tsx`**

```tsx
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
```

This produces byte-identical rendered output to the version before this task — only the internals moved.

- [ ] **Step 4: Rewrite `frontend/src/core/playground/promptRegistry.ts`**

```ts
import type { ComponentType } from 'react'
import type { PlaygroundItem } from '../../types/content'

export type PromptComponent = ComponentType<{ item: PlaygroundItem }>

const registry = new Map<string, PromptComponent>()

/** A kickoff calls this at import time to plug its own prompt type into core. */
export function registerPrompts(entries: Record<string, PromptComponent>): void {
  for (const [type, component] of Object.entries(entries)) {
    registry.set(type, component)
  }
}

export function getPromptComponent(type: string): PromptComponent | undefined {
  return registry.get(type)
}
```

- [ ] **Step 5: Rewrite `frontend/src/kickoffs/piano/NoteLetterPrompt.tsx`**

```tsx
import type { PlaygroundItem } from '../../types/content'

export function NoteLetterPrompt({ item }: { item: PlaygroundItem }) {
  return (
    <span className="font-display text-[7rem] leading-none text-ink sm:text-[11rem]">
      {String(item.note ?? '')}
    </span>
  )
}
```

- [ ] **Step 6: Update `frontend/public/content/piano.json`'s `playground.items`**

Change only the `items` array inside the existing top-level `playground` object — from bare strings to `{ "note": ... }` objects. Leave every other field in the file (including the still-old `exerciseNumber`/`exerciseTitle`/`idea`/`whatsNext`/`closing` top-level fields — those are rewritten wholesale in Task 7) exactly as they are:

```json
    "items": [
      { "note": "C" },
      { "note": "D" },
      { "note": "E" },
      { "note": "F" },
      { "note": "G" },
      { "note": "A" },
      { "note": "B" }
    ],
```

- [ ] **Step 7: Verify the build**

Run: `cd frontend && npm run build`
Expected: **passes** — this task's changes, together with Tasks 1-2, bring every file back into a consistent, type-checked state. `KickoffRoute.tsx` still references the old `Kickoff` fields (`exerciseNumber`, `idea`, `playground`, `whatsNext`) which Task 1's type removed — if the build still fails, it should fail *only* in `KickoffRoute.tsx`. That file is rewritten in Task 7; if it is the only remaining error, that is expected and you should proceed to Task 4. If the build fails anywhere else, stop and fix it before proceeding — everything else in this task's own list must be clean.

- [ ] **Step 8: Manual check**

Run `npm run dev`. Since `KickoffRoute.tsx` hasn't been rewritten yet (that's Task 7), if the build is genuinely blocked by it you won't be able to load the page yet — in that case, skip this step and note it in your report; Task 7's own verification will cover Exercise 01's playground behavior. If the dev server does start and `/piano` loads (TypeScript errors in an unrelated file sometimes don't block Vite's dev server, only `tsc -b`), confirm: the note letter still appears and changes on the timer, pause (button and spacebar) still works, speed and order buttons still work, and open your browser's Page/Application panel to confirm a screen wake lock is held (Chrome DevTools: Application tab → Background Services, or simply note that the screen does not dim/lock while the tab is open and focused, if you can test on a device where you'd normally see that happen).

- [ ] **Step 9: Commit**

```bash
git add frontend/src/core/playground/usePlayground.ts frontend/src/core/playground/Playground.tsx frontend/src/core/playground/PlaygroundControls.tsx frontend/src/core/playground/promptRegistry.ts frontend/src/kickoffs/piano/NoteLetterPrompt.tsx frontend/public/content/piano.json
git commit -m "refactor: rebuild the generic playground on the shared primitives; widen items to objects"
```

---

## Task 4: Five-finger-scale domain logic

**Files:**
- Create: `frontend/src/kickoffs/piano/scaleDrill.ts`

**Interfaces:**
- Consumes: `fiveFingerNotes(start: string): string[]` from `frontend/src/kickoffs/piano/handPosition.ts` (already exists, unchanged).
- Produces: `type ScaleStep = { scale: string; note: string; rightFinger: number; leftFinger: number }`; `scaleSteps(scale: string): ScaleStep[]`; `allScaleSteps(scales: string[]): ScaleStep[]`.

- [ ] **Step 1: Write `frontend/src/kickoffs/piano/scaleDrill.ts`**

```ts
import { fiveFingerNotes } from './handPosition'

export type ScaleStep = {
  scale: string
  note: string
  rightFinger: number
  leftFinger: number
}

const RIGHT_FINGER_SEQUENCE = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1]
const LEFT_FINGER_SEQUENCE = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5]

/**
 * The 10-step up-and-down drill for one scale: the five-finger-position
 * notes ascending, the top note held once for the turn, then the same five
 * descending back to the start.
 */
export function scaleSteps(scale: string): ScaleStep[] {
  const notes = fiveFingerNotes(scale)
  if (notes.length === 0) return []
  const noteSequence = [...notes, ...[...notes].reverse()]
  return noteSequence.map((note, index) => ({
    scale,
    note,
    rightFinger: RIGHT_FINGER_SEQUENCE[index],
    leftFinger: LEFT_FINGER_SEQUENCE[index],
  }))
}

/** All of the given scales' 10-step drills, concatenated in order — for "in order" mode. */
export function allScaleSteps(scales: string[]): ScaleStep[] {
  return scales.flatMap(scaleSteps)
}
```

- [ ] **Step 2: Hand-trace the result and record it**

There is no test suite, so trace this by hand and record the trace in your task report, the same way earlier domain logic in this project was hand-verified. For `scaleSteps('C')`, `fiveFingerNotes('C')` returns `['C','D','E','F','G']`. The 10-step sequence should be:

```
index:        0  1  2  3  4  5  6  7  8  9
note:         C  D  E  F  G  G  F  E  D  C
rightFinger:  1  2  3  4  5  5  4  3  2  1
leftFinger:   5  4  3  2  1  1  2  3  4  5
```

Confirm this by reading the code rather than assuming — `noteSequence` is `[C,D,E,F,G]` concatenated with its own reverse `[G,F,E,D,C]`, giving exactly the 10 values above in order, paired index-for-index with the two fixed finger arrays. Also trace `scaleSteps('F')` in your report (this one crosses the B→C wraparound inside `fiveFingerNotes`): expect notes `F,G,A,B,C,C,B,A,G,F`. Confirm `allScaleSteps(['C','G','A','F'])` has length 40.

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: passes (this file isn't imported by anything yet, so it can't introduce a new failure beyond the pre-existing `KickoffRoute.tsx` situation noted in Task 3).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/kickoffs/piano/scaleDrill.ts
git commit -m "feat: add the five-finger-scale step sequence logic"
```

---
## Task 5: The Scale Drill playground component

**Files:**
- Create: `frontend/src/kickoffs/piano/ScaleDrillPlayground.tsx`

**Interfaces:**
- Consumes: `scaleSteps`, `allScaleSteps`, `ScaleStep` (Task 4); `usePlaygroundTimer`, `useSpacebarPause`, `useWakeLock`, `SpeedControl`, `PauseControl` (Task 2); `nextIndex` (existing, unchanged); `TimingLine` (existing, unchanged); `Speed` (Task 1).
- Produces: `<ScaleDrillPlayground config={Record<string, unknown>} />` — a component matching the shape the playground registry (Task 6) expects: `ComponentType<{ config: Record<string, unknown> }>`.

This component is not wired into any route yet — that happens in Task 7. It can and should still be built completely and correctly now; Task 6 registers it, Task 7 makes it reachable.

- [ ] **Step 1: Write `frontend/src/kickoffs/piano/ScaleDrillPlayground.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: passes (this file isn't imported by anything yet).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/kickoffs/piano/ScaleDrillPlayground.tsx
git commit -m "feat: add the Scale Drill playground for Exercise 02"
```

---

## Task 6: The playground-type registry

**Files:**
- Create: `frontend/src/core/playground/playgroundRegistry.ts`, `frontend/src/core/playground/PlaygroundHost.tsx`, `frontend/src/core/playground/index.tsx`
- Modify: `frontend/src/kickoffs/piano/index.ts`, `frontend/src/kickoffs/index.ts`, `frontend/src/main.tsx`

**Interfaces:**
- Consumes: `Playground` (existing), `PlaygroundConfig` (Task 1), `ScaleDrillPlayground` (Task 5).
- Produces: `type PlaygroundComponent = ComponentType<{ config: Record<string, unknown> }>`; `registerPlaygrounds(entries: Record<string, PlaygroundComponent>): void`; `getPlaygroundComponent(type: string): PlaygroundComponent | undefined`; `<PlaygroundHost type={string} config={Record<string, unknown>} />`. Importing `frontend/src/core/playground/index.tsx` registers `"GENERIC"`. Importing `frontend/src/kickoffs/piano/index.ts` registers `"SCALE_DRILL"`.

This is the third registry in the app, exactly parallel to the block registry (`core/blocks`) and the prompt registry (`core/playground/promptRegistry.ts`): core owns the lookup mechanism and a graceful fallback for an unregistered type; it never inspects what a registered component does.

- [ ] **Step 1: Write `frontend/src/core/playground/playgroundRegistry.ts`**

```ts
import type { ComponentType } from 'react'

export type PlaygroundComponent = ComponentType<{ config: Record<string, unknown> }>

const registry = new Map<string, PlaygroundComponent>()

/** Core registers "GENERIC" itself; a kickoff calls this to plug in its own bespoke playground types. */
export function registerPlaygrounds(entries: Record<string, PlaygroundComponent>): void {
  for (const [type, component] of Object.entries(entries)) {
    registry.set(type, component)
  }
}

export function getPlaygroundComponent(type: string): PlaygroundComponent | undefined {
  return registry.get(type)
}
```

- [ ] **Step 2: Write `frontend/src/core/playground/PlaygroundHost.tsx`**

```tsx
import { getPlaygroundComponent } from './playgroundRegistry'

/**
 * Looks up a playground by its opaque type string and renders it. Core never
 * inspects `config` — whichever component `type` selects owns its shape.
 */
export function PlaygroundHost({ type, config }: { type: string; config: Record<string, unknown> }) {
  const Component = getPlaygroundComponent(type)
  if (!Component) {
    console.warn(`Kick Off: no renderer registered for playground type "${type}"`)
    return null
  }
  return <Component config={config} />
}
```

- [ ] **Step 3: Write `frontend/src/core/playground/index.tsx`**

```tsx
import type { PlaygroundConfig } from '../../types/content'
import { Playground } from './Playground'
import { registerPlaygrounds } from './playgroundRegistry'

/** Adapts the existing declarative `<Playground config={PlaygroundConfig} />` to the opaque registry shape. */
function GenericPlayground({ config }: { config: Record<string, unknown> }) {
  return <Playground config={config as unknown as PlaygroundConfig} />
}

registerPlaygrounds({ GENERIC: GenericPlayground })

export { getPlaygroundComponent, registerPlaygrounds } from './playgroundRegistry'
export type { PlaygroundComponent } from './playgroundRegistry'
export { PlaygroundHost } from './PlaygroundHost'
export { Playground } from './Playground'
```

- [ ] **Step 4: Modify `frontend/src/kickoffs/piano/index.ts`**

Read the current file first — it registers blocks and the `NOTE_LETTER` prompt. Add the `ScaleDrillPlayground` registration alongside those, importing `registerPlaygrounds` from the new core barrel:

```ts
import { registerBlocks } from '../../core/blocks'
import { registerPlaygrounds } from '../../core/playground'
import { registerPrompts } from '../../core/playground/promptRegistry'
import { HandRuleBlock } from './HandRuleBlock'
import { KeyboardBlock } from './KeyboardBlock'
import { NoteLetterPrompt } from './NoteLetterPrompt'
import { ScaleDrillPlayground } from './ScaleDrillPlayground'

registerBlocks({
  KEYBOARD: KeyboardBlock,
  HAND_RULE: HandRuleBlock,
})

registerPrompts({
  NOTE_LETTER: NoteLetterPrompt,
})

registerPlaygrounds({
  SCALE_DRILL: ScaleDrillPlayground,
})
```

- [ ] **Step 5: Modify `frontend/src/kickoffs/index.ts`**

Read the current file first. Add an import of the new core playground barrel, alongside the existing blocks import, so `"GENERIC"` is registered before anything renders:

```ts
// Importing this module wires every kickoff into core. Add new kickoffs here.
import '../core/blocks'
import '../core/playground'
import './piano'
```

- [ ] **Step 6: Update the stale comment in `frontend/src/main.tsx`**

Read the current file first. It has a comment that will now undersell what the import does:

```ts
import './kickoffs' // registers every kickoff's blocks and prompts before first render
```

Change the comment only — the import itself doesn't change:

```ts
import './kickoffs' // registers every kickoff's blocks, prompts, and playground types before first render
```

- [ ] **Step 7: Verify the build**

Run: `cd frontend && npm run build`
Expected: passes, other than the still-outstanding `KickoffRoute.tsx` mismatch already noted in Task 3 (fixed in Task 7). Nothing in this task's own files should introduce a new error.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/core/playground/playgroundRegistry.ts frontend/src/core/playground/PlaygroundHost.tsx frontend/src/core/playground/index.tsx frontend/src/kickoffs/piano/index.ts frontend/src/kickoffs/index.ts frontend/src/main.tsx
git commit -m "feat: add the playground-type registry and register GENERIC and SCALE_DRILL"
```

---

## Task 7: Content model migration and hub/exercise routing

This task is intentionally one atomic unit rather than split further: restructuring `piano.json` into
the new `exercises[]` shape and rewriting the routing to read that shape must land together, or the app
is broken in between (the content and the code that reads it would disagree about the data shape, and
nothing would catch that at compile time — `piano.json` is loaded at runtime, not type-checked against
`Kickoff` by the compiler).

**Files:**
- Modify: `frontend/public/content/piano.json`, `frontend/src/app/router.tsx`, `frontend/src/app/routes/KickoffRoute.tsx`
- Create: `frontend/src/app/routes/ExerciseRoute.tsx`

**Interfaces:**
- Consumes: `Exercise`, `Kickoff` (Task 1); `PlaygroundHost` (Task 6); `BlockRenderer` (existing); `KickoffTheme`, `Section` (existing).
- Produces: `type ExerciseLoaderData = { kickoff: Kickoff; exercise: Exercise }`, exported from `ExerciseRoute.tsx`.

- [ ] **Step 1: Rewrite `frontend/public/content/piano.json` in full**

Every string in Exercise 01's `idea` array is carried over unchanged from the current file — only the
surrounding structure changes (wrapped into `exercises[0]`, with `playground.items` already migrated to
objects in Task 3).

```json
{
  "slug": "piano",
  "title": "Piano",
  "tagline": "Find your way around the keys.",
  "category": "Music",
  "accent": "#b4622a",
  "status": "LIVE",
  "closing": "And when you have this — go and play a real piano. Kick Off is for starting, not for staying.",
  "exercises": [
    {
      "slug": "hand-position",
      "number": "01",
      "title": "Find your hand position",
      "status": "LIVE",
      "idea": [
        {
          "type": "PROSE",
          "text": "Eighty-eight keys looks like a lot to learn. It isn't. The whole keyboard is one small pattern printed over and over, and once you can see the pattern you can find any note on any piano in the world."
        },
        {
          "type": "KEYBOARD",
          "octaves": 2,
          "labels": "none",
          "caption": "Two of everything. Ignore the white keys for a second and just look at the black ones.",
          "ariaLabel": "Two octaves of a piano keyboard with no labels, showing black keys in alternating groups of two and three."
        },
        {
          "type": "KEY_IDEA",
          "text": "The black keys come in groups of two and three. That is the entire map."
        },
        {
          "type": "PROSE",
          "text": "Those groups never change and never break. Two, three, two, three, all the way up. Which means you always know roughly where you are — and it gives you one landmark you can find without counting anything."
        },
        {
          "type": "KEYBOARD",
          "octaves": 2,
          "labels": "c-only",
          "highlight": ["C"],
          "caption": "The white key immediately left of any group of two is C. Every time, on every piano.",
          "ariaLabel": "Two octaves of a piano keyboard with the C keys highlighted and labelled, each sitting immediately to the left of a group of two black keys."
        },
        {
          "type": "PROSE",
          "text": "From C, the white keys just walk up the alphabet — C, D, E, F, G, A, B — and then start again at C. Seven letters, repeating forever. That is every white key on the instrument."
        },
        {
          "type": "KEYBOARD",
          "octaves": 2,
          "labels": "all",
          "caption": "Seven letters, then the same seven again.",
          "ariaLabel": "Two octaves of a piano keyboard with every white key labelled C, D, E, F, G, A, B and then repeating."
        },
        {
          "type": "KEY_IDEA",
          "text": "You are only ever learning seven names. Everything else is repetition."
        },
        {
          "type": "PROSE",
          "text": "Now put your hands on it. Pick any note — say F. Your right thumb goes on that F, and your other four fingers take the next four white keys going up. Your left hand takes the same five white keys an octave lower, but mirrored: pinky on the F, thumb at the top."
        },
        { "type": "HAND_RULE", "note": "F" },
        {
          "type": "PROSE",
          "text": "There is no correct octave and no correct place on the keyboard. Anywhere comfortable is right. The shape is the thing you are learning, not the location."
        }
      ],
      "playgroundType": "GENERIC",
      "playground": {
        "promptType": "NOTE_LETTER",
        "items": [
          { "note": "C" },
          { "note": "D" },
          { "note": "E" },
          { "note": "F" },
          { "note": "G" },
          { "note": "A" },
          { "note": "B" }
        ],
        "order": "RANDOM",
        "speeds": [
          { "label": "Unhurried", "ms": 8000 },
          { "label": "Steady", "ms": 5000 },
          { "label": "Brisk", "ms": 3000 }
        ],
        "defaultSpeedLabel": "Unhurried",
        "instruction": "Right thumb on the note. Left pinky on the same note, an octave down."
      }
    },
    {
      "slug": "five-finger-scale",
      "number": "02",
      "title": "Play the five-finger scale",
      "status": "LIVE",
      "idea": [
        {
          "type": "PROSE",
          "text": "You already know how to position your hand around any note. Now put it to work: walk through all five fingers in order, then walk back the way you came."
        },
        { "type": "HAND_RULE", "note": "C" },
        {
          "type": "KEY_IDEA",
          "text": "Thumb to pinky, then pinky back to thumb."
        },
        {
          "type": "PROSE",
          "text": "You'll practice this on four scales: C, G, A, and F. Play with your right hand, your left hand, or both together — whichever you choose, nothing here tracks it."
        }
      ],
      "playgroundType": "SCALE_DRILL",
      "playground": {
        "scales": ["C", "G", "A", "F"],
        "speeds": [
          { "label": "Unhurried", "ms": 1500 },
          { "label": "Steady", "ms": 1000 },
          { "label": "Brisk", "ms": 600 }
        ],
        "defaultSpeedLabel": "Unhurried",
        "instruction": "Walk up through your fingers, then back down."
      }
    },
    {
      "slug": "name-the-note",
      "number": "03",
      "title": "Name the note",
      "status": "COMING_SOON",
      "description": "See a key, know what it is called — without counting up from C every time."
    },
    {
      "slug": "keep-time",
      "number": "04",
      "title": "Keep time",
      "status": "COMING_SOON",
      "description": "Play a steady beat and stay inside it, which is harder and more useful than it sounds."
    },
    {
      "slug": "first-chord",
      "number": "05",
      "title": "Your first chord",
      "status": "COMING_SOON",
      "description": "Three notes at once, using the hand shape you already know."
    }
  ]
}
```

- [ ] **Step 2: Rewrite `frontend/src/app/routes/KickoffRoute.tsx` in full — it becomes the hub**

```tsx
import { Link, useLoaderData } from 'react-router-dom'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import type { Kickoff } from '../../types/content'

export function KickoffRoute() {
  const kickoff = useLoaderData() as Kickoff

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{kickoff.category}</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-ink sm:text-8xl">{kickoff.title}</h1>
        <p className="mt-5 max-w-[40ch] text-xl text-ink-muted sm:text-2xl">{kickoff.tagline}</p>
      </header>

      <ul className="mt-16 border-t border-line sm:mt-24">
        {kickoff.exercises.map((exercise) =>
          exercise.status === 'LIVE' ? (
            <li key={exercise.slug} className="border-b border-line">
              <Link
                to={`/${kickoff.slug}/${exercise.slug}`}
                className="group flex flex-col gap-2 py-8 transition-colors sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="font-display text-sm text-ink-faint sm:w-8">{exercise.number}</span>
                <span className="font-display text-3xl text-ink transition-colors group-hover:text-accent sm:text-4xl">
                  {exercise.title}
                </span>
                <span
                  aria-hidden="true"
                  className="text-base text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent sm:ml-auto"
                >
                  →
                </span>
              </Link>
            </li>
          ) : (
            <li
              key={exercise.slug}
              className="flex flex-col gap-2 border-b border-line py-8 opacity-60 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="font-display text-sm text-ink-faint sm:w-8">{exercise.number}</span>
              <span className="font-display text-3xl text-ink-faint sm:text-4xl">{exercise.title}</span>
              {exercise.description ? (
                <span className="max-w-[40ch] text-ink-faint">{exercise.description}</span>
              ) : null}
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint sm:ml-auto">Soon</span>
            </li>
          ),
        )}
      </ul>

      <p className="mt-12 max-w-[46ch] text-ink-muted">{kickoff.closing}</p>
    </KickoffTheme>
  )
}
```

- [ ] **Step 3: Write `frontend/src/app/routes/ExerciseRoute.tsx`**

```tsx
import { Link, useLoaderData } from 'react-router-dom'
import { BlockRenderer } from '../../core/blocks'
import { PlaygroundHost } from '../../core/playground'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import { Section } from '../../core/ui/Section'
import type { Exercise, Kickoff } from '../../types/content'

export type ExerciseLoaderData = { kickoff: Kickoff; exercise: Exercise }

export function ExerciseRoute() {
  const { kickoff, exercise } = useLoaderData() as ExerciseLoaderData

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <Link to={`/${kickoff.slug}`} className="text-sm text-ink-faint transition-colors hover:text-ink">
          ← {kickoff.title}
        </Link>
        <p className="mt-6 text-sm text-ink-faint">
          <span className="text-accent">{exercise.number}</span>
          <span className="mx-2">·</span>
          {exercise.title}
        </p>
      </header>

      <Section title="The Idea">
        <div className="flex flex-col items-start gap-12">
          <BlockRenderer blocks={exercise.idea ?? []} />
        </div>
      </Section>

      <Section title="The Playground">
        {exercise.playgroundType && exercise.playground ? (
          <PlaygroundHost type={exercise.playgroundType} config={exercise.playground} />
        ) : null}
      </Section>
    </KickoffTheme>
  )
}
```

- [ ] **Step 4: Rewrite `frontend/src/app/router.tsx` in full**

```tsx
import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '../core/shell/Shell'
import { loadKickoff, loadShelf } from '../services/contentSource'
import { ExerciseRoute } from './routes/ExerciseRoute'
import { HomeRoute } from './routes/HomeRoute'
import { KickoffRoute } from './routes/KickoffRoute'
import { RouteError } from './routes/RouteError'

export const routes: RouteObject[] = [
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomeRoute />, loader: () => loadShelf(), errorElement: <RouteError /> },
      {
        path: '/:slug',
        element: <KickoffRoute />,
        loader: ({ params }: LoaderFunctionArgs) => loadKickoff(params.slug as string),
        errorElement: <RouteError />,
      },
      {
        path: '/:slug/:exerciseSlug',
        element: <ExerciseRoute />,
        loader: async ({ params }: LoaderFunctionArgs) => {
          const kickoff = await loadKickoff(params.slug as string)
          const exercise = kickoff.exercises.find(
            (candidate) => candidate.slug === params.exerciseSlug && candidate.status === 'LIVE',
          )
          if (!exercise) {
            throw new Error(`Could not find exercise "${params.exerciseSlug}" in ${params.slug}.`)
          }
          return { kickoff, exercise }
        },
        errorElement: <RouteError />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
```

- [ ] **Step 5: Verify the build**

Run: `cd frontend && npm run build`
Expected: **passes cleanly, with no errors anywhere.** This is the first point since Task 1 where the whole app is back in a fully consistent state.

- [ ] **Step 6: Manual walkthrough**

Run `npm run dev` and check, in order:

1. `/piano` shows the hub: title "Piano", tagline, and a list of five rows — `01 Find your hand position` and `02 Play the five-finger scale` as clickable links with a hover arrow, then `03 Name the note`, `04 Keep time`, `05 Your first chord` shown dimmed with their descriptions and a "Soon" label, not clickable. The closing line appears once at the bottom.
2. Clicking `01` navigates to `/piano/hand-position` and behaves exactly as the single-page kickoff did before this plan: the same primer content, the same note-letter playground, pause/speed/order all working.
3. Clicking `02` navigates to `/piano/five-finger-scale`: the primer shows the four paragraphs/blocks from Step 1 above (including the reused hand-position table anchored on C), and the playground shows a note, its scale name above it, and both hands' finger numbers below it, advancing automatically.
4. In Exercise 02, toggle **Stay** — a row of four scale buttons (C, G, A, F) appears; click through a couple and confirm the display always restarts at the first step of that scale (finger 1, the target note itself) rather than continuing mid-sequence.
5. Toggle **In order** — the scale-picker row disappears, and watching it for more than one scale's worth of steps confirms it moves C → G → A → F and back to C automatically.
6. Change Speed while in either mode and confirm the timing line's duration changes accordingly (1.5s / 1s / 0.6s).
7. Pause via both the button and the spacebar on Exercise 02, exactly as already true for Exercise 01.
8. Navigate to a nonexistent exercise, e.g. `/piano/does-not-exist` — confirm `RouteError` renders "That didn't load." with a message naming the missing exercise, not a blank page or a console exception.
9. Navigate directly to `/piano/name-the-note` (a `COMING_SOON` slug with no content) — confirm this also renders through `RouteError` rather than crashing, since the loader's `LIVE`-only lookup won't find it.

- [ ] **Step 7: Commit**

```bash
git add frontend/public/content/piano.json frontend/src/app/router.tsx frontend/src/app/routes/KickoffRoute.tsx frontend/src/app/routes/ExerciseRoute.tsx
git commit -m "feat: split the Piano kickoff into a hub and per-exercise pages; add Exercise 02 content"
```

---

## Task 8: Verification and polish

**Files:**
- Modify: any file needing a fix found below

**Interfaces:**
- Consumes: everything.
- Produces: a verified build and a working app.

- [ ] **Step 1: Verify core never learned about the new vocabulary**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff/frontend"
grep -rniE '\b(piano|scale|finger|octave|keyboard)\b|\bnote\b' src/core src/app --include='*.ts' --include='*.tsx'
```

Expected: **no output.** If anything appears, it is a leak of piano-specific knowledge into core or app — move it into `src/kickoffs/piano/`. (This check now also covers `scale`/`finger`, which Exercise 02 introduces — the original Task 11 check from the first plan only covered `piano`/`note`/`keyboard`/`finger`/`octave`; `scale` is new vocabulary this plan adds and must be checked too.)

- [ ] **Step 2: Full production build**

```bash
npm run build
```

Expected: succeeds, zero TypeScript errors.

- [ ] **Step 3: Look at it end to end**

```bash
npm run dev
```

Walk the full journey once more, fresh: Home → Piano → hub → Exercise 01 → back to hub → Exercise 02 → try both modes, all three speeds, both hands' numbers visible, pause via button and spacebar. Confirm the accent color (`#b4622a`) still appears consistently across both exercise pages (the "01"/"02" numbers, any highlighted keys, the timing line).

- [ ] **Step 4: Check the three breakpoints**

Resize to 375px, 768px, and 1280px on both the hub and Exercise 02's playground specifically (the scale-picker row and mode toggle are new controls that haven't been checked at small widths before). Confirm no horizontal page scroll and that the controls wrap onto their own rows rather than overflowing at 375px.

- [ ] **Step 5: Check reduced motion and keyboard navigation on Exercise 02**

With Reduce Motion on (macOS: System Settings → Accessibility → Display), confirm the scale drill's note still advances on the timer with instant transitions, exactly as already verified for Exercise 01. Tab through Exercise 02's controls and confirm every button (speed, mode, scale picker when visible, pause) is reachable with a visible focus outline, and that the current note/scale/finger numbers live inside the `role="status"` live region.

- [ ] **Step 6: Fix anything the walkthrough surfaced, then re-run**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
git add -A
git commit -m "chore: verify multi-exercise Piano kickoff and the five-finger scale end to end"
```

---

## Self-Review

**Spec coverage**

| Spec section | Covered by |
|---|---|
| §2 Content model (`Exercise`, restructured `Kickoff`) | Task 1 |
| §3 Routing (`/piano`, `/piano/:exerciseSlug`) | Task 7 |
| §4 Engine generalization (primitives, opaque items, playground registry) | Tasks 2, 3, 6 |
| §5 Exercise 02 primer content | Task 7, Step 1 |
| §6 Scale mechanic (10-step pattern, both modes, speeds, display, reset-on-switch) | Tasks 4, 5 |
| §7 Wake Lock | Task 2 (`useWakeLock`), wired in Tasks 3 and 5 |
| §8 Process note (no tests/review) | Global Constraints |
| §9 Out of scope | Not built — confirmed absent: no MIDI/input detection, no generic "extra controls" abstraction beyond the one bespoke component, second future exercise untouched |
| §10 Definition of done | Task 7 Step 6, Task 8 |

**Gap found and fixed during planning:** the spec's `Exercise` type (§2) had no field for the short
descriptions the original `whatsNext` list carried for unbuilt exercises. Task 1 adds an optional
`description` field so that content isn't silently lost in the migration — a small, additive fix
consistent with the spec's intent, not a deviation from anything it decided.

**Placeholder scan:** no TBD/TODO; every step has complete code or a fully specified manual check.

**Type consistency:** `PlaygroundItem` (Task 1) flows unchanged through `usePlayground.ts`,
`promptRegistry.ts`, and `NoteLetterPrompt.tsx` (Task 3). `ScaleStep` (Task 4) matches exactly what
`ScaleDrillPlayground.tsx` (Task 5) destructures (`scale`, `note`, `rightFinger`, `leftFinger`).
`PlaygroundComponent`'s `{ config: Record<string, unknown> }` shape (Task 6) matches both
`GenericPlayground`'s and `ScaleDrillPlayground`'s actual prop signatures. `ExerciseLoaderData` (Task 7)
matches exactly what the router's new loader returns and what `ExerciseRoute` destructures.
