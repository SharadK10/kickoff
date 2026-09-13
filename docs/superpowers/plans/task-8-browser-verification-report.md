# Piano kickoff hub restructure — browser verification report

Date: 2026-09-13
Method: The session had no MCP browser-automation tool (`claude-in-chrome` was
listed as a skill but not actually registered/invokable, and no `mcp__*`
browser tools were available via ToolSearch). Node 24.21.0 and a working
Playwright + Chromium install were already present on the machine
(`~/Library/Caches/ms-playwright/chromium-1243`), so verification was done by
driving real headless Chromium via Playwright scripts against the already-running
dev server at `http://localhost:5173` (left running, not restarted). This is a
real browser executing the real app, not a static/code read — every check below
reflects actual DOM state, actual timers, and actual click/keyboard events.

Dev server: already running on port 5173 at start of this task; left running afterward.

## Summary

**ALL PASS.** No functional bugs found. One transient, non-reproducible flake
is noted under item 1 for transparency but could not be reproduced across 19
follow-up trials, so it is not reported as a bug.

---

## 1. Full journey (Home → Piano hub → Exercise 01 → back → Exercise 02)

**PASS.**

- Home (`/`) loads cleanly (title "Kick Off"), has a "Piano" link, clicking it
  navigates to `/piano`.
- Hub page (`/piano`) body text, in order:
  - Title "Kick Off", tagline "Fundamentals first. Then it's a playground."
  - "Piano" section heading, "Find your way around the keys."
  - `01 Find your hand position →` — real link (confirmed via DOM: only two
    `<a>` elements exist besides the header logo — "01 Find your hand
    position" and "02 Play the five-finger scale")
  - `02 Play the five-finger scale →` — real link
  - `03 Name the note` — dimmed, "SOON" badge, not a link
  - `04 Keep time` — dimmed, "SOON" badge, not a link
  - `05 Your first chord` — dimmed, "SOON" badge, not a link
  - Confirmed exactly 3 "SOON" badges exist on the page and exactly 2
    exercise links exist (01 and 02) — matches spec exactly.
  - Closing line "And when you have this — go and play a real piano. Kick Off
    is for starting, not for staying." appears once, at the bottom.
- Clicking "01 Find your hand position" navigates to `/piano/hand-position`.
  Both the primer (keyboard/black-key explanation, the hand-position table
  anchored on F in this exercise's example) and the playground (large letter
  in a `role="status"` element, Speed/Order controls, Pause button) render.
- Confirmed the playground's displayed letter changes on the default
  ("Unhurried") timer: sampled the `role="status"` text before and after a
  9-second wait — it changed from `C` to `A`.
- The "← Piano" back-link (`href="/piano"`) is present and, when clicked,
  navigates back to `/piano`. Verified across many separate trials (see note
  below).
- From the hub, clicked "02 Play the five-finger scale" → navigates to
  `/piano/five-finger-scale`. Its primer renders (shorter prose, a
  hand-position table anchored on C, a pull-quote "Thumb to pinky, then pinky
  back to thumb.", and closing prose naming "C, G, A, and F"). Its playground
  shows `SCALE OF C` label, big note letter `C`, and `right 1 · left 5`
  beneath it, all inside one `role="status"` element, and it visibly changed
  within ~2.2 seconds (default Steady-ish "Unhurried" 1.5s step for this
  exercise), confirmed by sampling before/after text: `SCALE OF C / C / right
  1 · left 5` → next step.

**Note on a one-off flake (not a reproducible bug):** During the very first
automated pass, one run of "wait 9s on hand-position page, then click ← Piano"
did not navigate. Suspecting a real race between the periodic letter-change
render and the click, I re-ran the identical scenario with wait times swept
across 7000–10000ms (13 trials) and then 6 more repetitions of the exact
original 9000ms case — all 19 follow-up trials navigated correctly, with the
click handler firing (`defaultPrevented: false`) and the URL changing every
time. This looks like a one-off scheduling hiccup in the test harness/browser
launch (multiple concurrent tool invocations were running at the time), not
an app defect. Recommend no action, but flagging for visibility since it
technically touches the exact interaction called out in the task.

---

## 2. Exercise 02's Stay / In-order behavior

**PASS**, all sub-checks verified live:

- Default mode is "In order": its button has `aria-pressed="true"` on load,
  and no scale-picker row is present (`getByRole('button', {name: 'G', exact:
  true})` count = 0 before any interaction).
- After switching to Brisk and sampling the status text every 400ms for 26
  seconds, the `SCALE OF X` label was observed to cycle `C → G → A → F` (all
  four letters seen, confirming the full 40-step concatenated sequence runs,
  not a single repeating scale).
- Clicking "Stay": a row of 4 buttons (`C`, `G`, `A`, `F`) appears
  immediately (count = 1 for the `C` button after click), and the display
  reset to finger 1 immediately — text was `SCALE OF C / C / right 1 · left
  5` right after the Stay click (i.e., whatever scale the in-order cycle
  happened to be on at click time, shown as its start position, not
  mid-sequence).
- Clicking the `G` scale-picker button: display immediately jumped to
  `SCALE OF G / G / right 1 · left 5`. Watching for 8 seconds at Brisk speed
  (0.6s/step) captured the full G loop: G → A → B → C → D → (turn) → D → C →
  B → A → G → G(hold) → A → B → C — i.e. it walks up 1→5 and back down 5→1
  through G's own five-finger pattern (G A B C D / right 1-5 / left 5-1) and
  loops back to G's start, never drifting into another scale. Every sample
  during this window showed `SCALE OF G` — confirmed no scale drift.
- Toggling back to "In order": the scale-picker row disappears (`C` button
  count = 0) and (per item's earlier full-cycle sample) the four-scale cycle
  resumes.

---

## 3. Pause behavior

**PASS.**

- Clicking the Pause button (mouse) changes its label to "Resume" and the
  `role="status"` text stops changing (sampled twice, 2.5s apart, identical).
- Clicking Resume: label reverts to "Pause" and the status text starts
  changing again (sampled twice, 2s apart, different).
- Pressing spacebar with body/page focus (not the button) toggled Pause →
  Resume correctly.
- Focus test requested in the task: focused the Pause button directly via
  `.focus()`, confirmed its text was "Pause", pressed Space once, checked
  immediately (150ms) and again after settling (600ms more): both reads
  showed "Resume" — the toggle fired **exactly once**, not zero times and not
  flipping back. No double-toggle bug.

---

## 4. Error routes

**PASS.**

- `/piano/does-not-exist` renders "That didn't load." with the message
  `Could not find exercise "does-not-exist" in piano.` — no blank page, no
  console errors, no page errors captured.
- `/piano/name-the-note` (a real, listed-but-COMING_SOON slug) renders the
  same error page: "That didn't load." / `Could not find exercise
  "name-the-note" in piano.` — again no blank page, no console/page errors.

---

## 5. Breakpoints (375px / 768px / 1280px) on Exercise 02's playground

**PASS.**

- At all three widths (with "Stay" mode active, so the scale-picker row is
  also present — the newest/most layout-risky state), `document.documentElement.scrollWidth`
  equaled `clientWidth` exactly (no horizontal overflow) at 375, 768, and 1280px.
- Visual screenshot at 375px confirms all controls wrap onto their own rows:
  Speed row (Unhurried/Steady/Brisk), a separate Stay/In-order row, Pause on
  its own row, and the C/G/A/F scale picker on its own row — nothing is
  clipped or overlapping.
- Visual screenshot at 768px confirms Speed + Stay/In-order + Pause fit on
  one row with the scale picker below it, still no overflow.

---

## 6. Reduced motion

**PASS.**

- Source inspection (`frontend/src/App.tsx`) shows the app wraps its router
  in `<MotionConfig reducedMotion="user">` (Framer Motion respecting the
  OS/browser `prefers-reduced-motion` setting automatically), backed by a
  global CSS rule in `frontend/src/styles/index.css`:
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after {
  animation-duration: 0.01ms !important; transition-duration: 0.01ms
  !important; } }`.
- Empirically confirmed via `page.emulateMedia({ reducedMotion: 'reduce' })`:
  computed `transitionDuration`/`animationDuration` on the status element and
  its children changed from `0s` (idle, no transition in flight) under normal
  motion to `1e-05s` (i.e. 0.01ms) under reduced motion — the CSS override is
  actually applying in a live browser, not just present in source.
- Confirmed the timer itself still advances under reduced motion: with Brisk
  speed and reduced motion emulated, the status text changed within a 2-second
  sample window, exactly as expected — only the animation is suppressed, not
  the interval logic.

---

## 7. Keyboard navigation / accessibility on Exercise 02

**PASS.**

- The note/scale/finger-numbers block lives inside a single element with
  `role="status"` (confirmed via `[role="status"]` locator, count = 1), and
  its text content includes both the note and "right N · left N" — i.e. the
  whole live region updates together.
- Tabbed through the page (15 Tab presses, in Stay mode so all controls
  including the scale picker are present) and got a clean, sensible,
  wrap-around cycle through every interactive element: header logo link → "←
  Piano" back-link → Speed (Unhurried, Steady, Brisk) → mode toggle (Stay, In
  order) → scale picker (C, G, A, F) → Pause → (wraps back to top). Every
  button correctly reports its `aria-pressed` state (Speed/mode/scale-picker
  buttons are toggle buttons with `aria-pressed`; Pause is a plain action
  button with no `aria-pressed`, which is correct since it isn't a toggle in
  the same sense).
- Every focused control showed a visible focus indicator:
  `outline-style: auto` (the browser's default visible focus ring, not
  suppressed) on all buttons and links tested. No interactive element had
  `outline: none` without a replacement indicator.

---

## Environment notes for whoever reads this later

- No `claude-in-chrome` or other MCP browser tool was actually available in
  this task's tool list, despite being listed as a skill name. Node 18 is the
  default on PATH; Node 24.21.0 (`$HOME/.nvm/versions/node/v24.21.0/bin`) plus
  a pre-existing Playwright 1.63.0 + Chromium 1243 cache
  (`~/Library/Caches/ms-playwright`) were used instead to drive a real
  browser. All scripts used for this pass live under
  `/private/tmp/claude-501/.../scratchpad/` (session scratchpad) and were not
  added to the repo.
- Dev server at `http://localhost:5173` was already running before this task
  started and was left running afterward, untouched.
