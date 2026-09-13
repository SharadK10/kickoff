# Piano — Multi-Exercise Kickoffs & the Five-Finger Scale (Design Spec)

**Date:** 2026-09-13
**Status:** Approved (design), pending implementation plan
**Supersedes (in part):** `docs/superpowers/specs/2026-09-12-kick-off-piano.md`, specifically its content
model (§2–§3: single-exercise `Kickoff`) and its "What's Next" section (§2, §5). Everything else in
that spec — the platform philosophy, the block/prompt registry pattern, the no-tracking/no-course
stance, the visual language — stands unchanged and this document builds directly on it.

---

## 1. What this adds

Two things:

1. **Kickoffs can now hold more than one exercise.** Piano moves from "one page, one exercise" to a
   hub page listing several exercises, each with its own page. This was always the intended shape
   (the previous spec's §2 explicitly anticipated it) — this is the moment it becomes real.
2. **Exercise 02 — Five-Finger Scale.** The learner plays through the five-finger hand position
   established in Exercise 01, one finger at a time, up and back down, across four starting notes.
   This is the first exercise where the learner is asked to actually *play*, paced by a timer.

A second future exercise was mentioned but not yet designed — out of scope for this document.

## 2. Content model

`Kickoff` no longer carries a single exercise inline. It carries an ordered list:

```ts
export type Exercise = {
  slug: string                    // "hand-position", "five-finger-scale" — the URL segment
  number: string                  // "01", "02"
  title: string
  status: 'LIVE' | 'COMING_SOON'
  idea?: Block[]                  // present only when LIVE
  playground?: PlaygroundConfig   // present only when LIVE — see §4 for its new shape
}

export type Kickoff = KickoffSummary & {
  closing: string
  exercises: Exercise[]
}
```

This **replaces** `exerciseNumber`, `exerciseTitle`, `idea`, `playground`, and `whatsNext` on the old
`Kickoff` type. There is no longer a separate "current exercise" vs. "what's next" distinction —
one list, some entries `LIVE`, some `COMING_SOON`.

**Piano's exercise list, in order:**

| # | slug | Title | Status |
|---|---|---|---|
| 01 | `hand-position` | Find your hand position | LIVE (existing, migrated) |
| 02 | `five-finger-scale` | Play the five-finger scale | LIVE (new, this document) |
| 03 | `name-the-note` | Name the note | COMING_SOON |
| 04 | `keep-time` | Keep time | COMING_SOON |
| 05 | `first-chord` | Your first chord | COMING_SOON |

(03–05 are the old placeholder entries, renumbered — none of them describe the five-finger scale, so
02 is a genuine insertion, not a rename.)

## 3. Routing

```
/piano                        → hub: title, tagline, exercise list, closing line
/piano/hand-position           → Exercise 01: The Idea + The Playground
/piano/five-finger-scale       → Exercise 02: The Idea + The Playground
```

`contentSource.ts` is unchanged — `loadKickoff(slug)` still fetches one JSON file. The exercise route's
loader fetches the kickoff and finds the matching entry in `.exercises` by slug; a slug with no match,
or a `COMING_SOON` entry with no `idea`/`playground`, renders through the existing `RouteError`
component rather than crashing. `COMING_SOON` entries are not clickable from the hub and have no route
of their own.

`KickoffRoute` (today's single-exercise page) splits into two: a **hub route** (new, small — identity +
exercise list + closing) and an **exercise route** (the Idea/Playground assembly logic that
`KickoffRoute` already has today, essentially unchanged, just operating on one `Exercise` instead of
the whole `Kickoff`).

## 4. The playground engine, generalized

**The problem:** Exercise 01's engine assumed a flat list of interchangeable strings, walked by one of
two baked-in strategies (Random, Sequential). Exercise 02 breaks both assumptions — each step carries
three fields (note, right-hand finger, left-hand finger), not one letter, and its two modes (Stay on
one scale / In order through all four) aren't a traversal-order choice over one fixed list; Stay mode
also needs a control Exercise 01 never had (a scale picker), shown only in that mode.

**The split:**

- **Core owns what's universal:** the timer, pause (button + spacebar), the timing line, the live
  region, the Speed control, and — new — the Wake Lock (§7). These are extracted into small,
  composable primitives rather than one monolithic component:
  - `usePlaygroundTimer({ isPaused, speedMs, onTick })` — the interval effect, pause-aware, nothing else.
  - `useWakeLock()` — acquires a screen wake lock while mounted, releases on unmount, re-acquires on
    tab visibility change. Feature-detected (`'wakeLock' in navigator`); silently does nothing where
    unsupported.
  - `SpeedControl` and `PauseControl` — extracted from today's monolithic `PlaygroundControls`, so an
    exercise can compose its own control bar from these plus its own buttons.
  - `TimingLine` — unchanged.
- **Each exercise owns its own sequencing and its own extra controls.** The existing declarative
  shorthand, `<Playground config={PlaygroundConfig} />`, keeps working for the simple case (a static
  item list, Random/Sequential) and is what Exercise 01 continues to use — internally rebuilt on top of
  the primitives above rather than owning its own separate timer logic. `PlaygroundConfig.items` widens
  from `string[]` to an opaque `PlaygroundItem[]` (`Record<string, unknown>`, matching how `Block`
  already works), and the registered prompt component receives the whole item instead of a bare string:

  ```ts
  export type PlaygroundItem = Record<string, unknown>
  export type PromptComponent = ComponentType<{ item: PlaygroundItem }>
  ```

  Exercise 01's `NoteLetterPrompt` and its content (`items: [{ note: "C" }, ...]`) migrate to this
  shape — a small, mechanical content change, no behavior change.

  Exercise 02 does **not** use the declarative shorthand — its sequencing (which of two fundamentally
  different item lists is active) is exercise-specific logic, not data, so it can't be expressed in
  static JSON alone. It gets its own component, `ScaleDrillPlayground.tsx`, living in
  `src/kickoffs/piano/`, which holds its own local state (selected mode, selected scale), computes the
  active item list from that state, and composes the shared primitives (`usePlaygroundTimer`,
  `useWakeLock`, `SpeedControl`, `PauseControl`, `TimingLine`) directly — plus renders its own
  mode-toggle and conditional scale-picker. Core is never told anything about scales, fingers, or modes;
  it only ever sees the shared primitives being used the same way Exercise 01 uses them.

This is a moderate, one-time refactor of the existing `core/playground/` module. Exercise 01's behavior
does not change for the learner — only its internal wiring and its content's item shape.

## 5. Exercise 02 — content

**The Idea** (four blocks — short, per the existing "not a lesson" rule):

1. Prose — "You already know how to position your hand around any note. Now put it to work: walk
   through all five fingers in order, then walk back the way you came."
2. `HAND_RULE` block (reused from Exercise 01's block registry, unchanged), anchored on C — a quick
   recap for anyone who lands here without having done Exercise 01.
3. `KEY_IDEA` — "Thumb to pinky, then pinky back to thumb."
4. Prose — names the four scales practiced here (C, G, A, F) and states explicitly that hand choice —
   right, left, or both — is up to the learner; nothing in the app tracks or requires a choice.

No new block types are introduced.

## 6. Exercise 02 — the five-finger-scale mechanic

**Deriving one scale's step sequence.** For a target note, reuse the existing `fiveFingerNotes(note)`
function unchanged — it already returns the five notes in order. The drill sequence is 10 steps: the
five notes ascending, then the same five descending, with the turn note (finger 5) played once at the
top before turning back:

```
notes  = fiveFingerNotes(target)              // [n0, n1, n2, n3, n4]
steps  = [n0, n1, n2, n3, n4, n4, n3, n2, n1, n0]   // 10 steps
rightFinger = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1]
leftFinger  = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5]
```

Each of the 10 `PlaygroundItem`s is `{ scale, note, rightFinger, leftFinger }` — `scale` is the target
note the sequence belongs to (e.g. `"C"`), carried on every item so the display (§6, below) always knows
which scale is currently active without tracking it separately. This computation is pure and belongs in
`src/kickoffs/piano/` (e.g. `scaleDrill.ts`), alongside `handPosition.ts` — it is exactly the kind of
piano-domain logic that must never leak into core.

**The four scales:** C, G, A, F — each expanded via the function above.

**Modes:**

- **In order** (default) — concatenate all four scales' 10-step sequences (C, then G, then A, then F),
  40 steps total, looping back to the start of C after F's last step.
- **Stay** — loop the 10-step sequence of one selected scale only. Selecting a scale resets the current
  step to 0. Default selected scale: **C**.

Both modes are, mechanically, "advance sequentially through the current item list, wrapping at the
end" — no new traversal algorithm is needed; `nextIndex`'s existing `SEQUENTIAL` branch already does
this. What changes between modes is which array is current, which is `ScaleDrillPlayground`'s own
concern, not core's.

**Switching modes, or switching the selected scale in Stay mode, always resets the current step to 0.**
Without this, changing mode could leave the current index pointing past the end of the newly active
list (e.g. index 35 from a 40-step In-order sequence is out of range for a 10-step single scale), or
mid-sequence in a way that makes the on-screen finger numbers momentarily contradict the note (a jump
from "finger 3 ascending" to "finger 3" of a different scale, with no visual continuity to explain the
jump). Always restarting at step 0 keeps every transition a clean, legible new beginning.

**Speeds** (new values, same three labels used elsewhere in the app):

| Label | Duration per step |
|---|---|
| Unhurried (default) | 1500ms |
| Steady | 1000ms |
| Brisk | 600ms |

**Display**, per step:

```
           Scale of C

              D
      right 2 · left 4
```

The note, large, in the same typographic treatment as Exercise 01's letter. Both hands' current finger
number shown together underneath, small and quiet — supporting information, not competing with the
note for attention. The active scale name sits above, small and de-emphasized, read from the current
item's `scale` field — this is what tells the learner which of the four scales they're in, which
matters most in In-order mode, where the scale changes automatically without any picker on screen to
announce it.

**Controls:** Speed (always shown) · Stay/In-order toggle (always shown) · a row of four scale buttons
(C, G, A, F), shown only when Stay is the active mode · Pause (always shown, button + spacebar, same
behavior as Exercise 01).

**Instruction line** (the small supporting sentence above the note, matching Exercise 01's pattern):
"Walk up through your fingers, then back down."

## 7. Wake Lock

Requested once, at the shared-primitive level (`useWakeLock`, §4), so both Exercise 01 and Exercise 02
get it automatically without either exercise's own code knowing it exists. Held for as long as a
playground is mounted and the tab is visible — pausing the timer does not release it, since the
learner is still on the practice screen, just not actively advancing. Feature-detected; browsers without
Wake Lock support see no difference in behavior (no error, no fallback UI, the screen just behaves as it
always has).

## 8. Process note (carried over from the previous spec)

Per the project's mid-execution ruling on 2026-09-12: this codebase currently ships without an
automated test suite and without per-task code review, by explicit product direction. Unless told
otherwise, the implementation plan for this document follows the same convention — verification is
`npm run build` plus a manual walkthrough of the running app, not a test suite. This is stated here so
it is a decision made once, visibly, rather than silently inherited or silently reversed.

## 9. Out of scope for this document

- The second future exercise mentioned but not yet described.
- Any actual input detection (MIDI, on-screen playable keys, audio pitch detection) — the learner reads
  the screen and plays on a real instrument, exactly as Exercise 01 works today. "Playing" here means
  the learner physically plays; the app does not verify it.
- A generalized "extra controls" registry mechanism for kickoffs core doesn't know about — Exercise 02
  gets a bespoke component (`ScaleDrillPlayground`) rather than a new pluggable-controls abstraction in
  core. Building that abstraction for a sample size of one additional exercise would be premature; if a
  third exercise needs the same custom-controls shape, that's the point to extract it.

## 10. Definition of done

A learner can open `/piano`, see two live exercises and three coming-soon ones, open
`/piano/five-finger-scale`, read a short primer that connects back to the hand position they already
know, and drop into a playground that shows one note and both hands' finger numbers at a time, paced by
a timer, across either one scale on loop or all four in sequence — with the screen staying awake the
whole time they're using it.
