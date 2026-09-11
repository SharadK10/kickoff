# Kick Off — Piano Kickoff (Design Spec)

**Date:** 2026-09-12
**Status:** Agreed
**Supersedes:** the original `Kick Off — Development Plan` document, which was explicitly
provided as a reference rather than a design. Where the two disagree, this spec wins.

---

## 1. Product

**Kick Off gets people started learning something.**

It is not a course, not a curriculum, not an LMS. It tracks nothing, scores nothing, gates
nothing, and remembers nobody. You arrive, you learn the one idea that unlocks a subject,
you mess around with it until it sticks, and you leave.

Kick Off is explicitly **not** where you are on day thirty. It is where you are on day zero.

## 2. The unit: a Kickoff

A **Kickoff** is a subject: Piano, Astronomy, Drawing, Fluid Mechanics. Piano does not
*contain* kickoffs — Piano **is** a kickoff. There is no path, track, or curriculum layer
above it.

Every kickoff has exactly three parts:

| Part | Purpose |
|---|---|
| **The Idea** | The smallest mental model that unlocks the subject. Not a lesson. |
| **The Playground** | Endless, unscored, playful practice of that one thing. |
| **What's Next** | The next exercises inside this kickoff. |

A kickoff may eventually hold several exercises; today Piano holds one
(`01 · Find your hand position`), and **What's Next** names the unbuilt ones so the shape of
the kickoff is visible and honest.

## 3. Today's scope

```
Home  ──►  Piano kickoff page
 │              │
 │              ├── The Idea        (primer, with keyboard diagrams)
 │              ├── The Playground  (timed note prompts)
 │              └── What's Next     (three named, unbuilt exercises)
 │
 └── one kickoff on the shelf; categories modelled, not surfaced
```

## 4. Piano — The Idea

The complete teaching content, in order. This is the whole primer; it is deliberately short.

1. Eighty-eight keys is one small pattern repeated. See the pattern, find any note anywhere.
2. **Key idea:** the black keys come in groups of two and three. That is the entire map.
3. The groups never break. The white key immediately left of any group of two is **C**.
4. From C the white keys walk the alphabet — C D E F G A B — then restart. Seven letters,
   forever.
5. **Key idea:** you are only ever learning seven names. Everything else is repetition.
6. The hand rule: right thumb on the note, the next four white keys under fingers 2–5.
   Left hand takes the same five white key names **an octave lower**, mirrored — pinky on
   the note, thumb at the top.
7. There is no correct octave. Anywhere comfortable is right. The shape is what matters.

White keys only. No sharps or flats anywhere in this kickoff.

## 5. Piano — The Playground

The screen shows **one white-key letter and nothing else**. No keyboard, no highlighted
keys, no finger diagram, no audio, no answer, no score, no session, no end.

This sparseness is the pedagogy, not a scope cut: showing the keyboard with the answer on
it is *recognition*, which feels productive and teaches little. Showing only `F` forces
*retrieval*, which is what builds the skill. Scaffolding must not be quietly added back in.

**Behaviour**

- Items: `C D E F G A B`
- Advance: automatic, on a timer
- Order: **Random** (default) or In order. Random never repeats the current note immediately.
- Speeds: **Unhurried 8s** (default) · **Steady 5s** · **Brisk 3s**
- Controls: **pause only**, on a button and on the spacebar. No skip, no restart, no next.
  Spacebar is chosen because it is reachable without breaking hand position.
- A single low-contrast timing line shows when the note will change. This is a deliberate
  exception to "no progress bars": without it the change is startling. It indicates timing,
  not achievement.

## 6. Architecture

Core is the platform. A kickoff plugs into it. **Core never learns what a note is.**

The entire extensibility contract is two registries and one config shape:

```ts
blockRegistry:  Record<string, FC<{ block: Block }>>    // piano adds KEYBOARD, HAND_RULE
promptRegistry: Record<string, FC<{ prompt: string }>>  // piano adds NOTE_LETTER
```

```ts
playground: {
  promptType: "NOTE_LETTER",       // opaque to core
  items: ["C","D","E","F","G","A","B"],
  order: "RANDOM",
  speeds: [{ label, ms }],
  defaultSpeedLabel: "Unhurried",
  instruction: "..."
}
```

Core owns the timer, order, pause, settings, transitions, shell, discovery, and rendering
of universal blocks. A kickoff owns its content, palette, custom blocks, and prompt
renderer. Core knows `type` strings; it never inspects their meaning.

Unknown block and prompt types must fail gracefully (render nothing, warn in dev) rather
than crash the page.

## 7. No backend today

There is nothing a server is needed for: no user state, no auth, no secrets, no
server-side generation, no non-repo authoring, and client-side search is instant at this
catalogue size. Content is authored by one person as JSON in the repo.

Content is fetched at runtime from `/content/*.json` — a real `fetch`, not a bundled
import — behind a single `contentSource` module, so loading and error states are real from
day one. **The day a backend is needed, only that module's URL changes.**

Triggers that would flip this decision: anyone but the author writing content; anything
persisted per-person; a kickoff needing server-side generation or grading; a paid API key.

## 8. Visual design

Warm, typography-led, spacious, minimal, playful without being childish. Light theme only —
a deliberate choice, not an omission.

- Display type: **Instrument Serif** (the note letter, kickoff titles)
- UI type: **Inter**
- Surface: warm off-white; ink: near-black warm grey; one accent per kickoff
- Per-kickoff theming is CSS custom properties on the page wrapper. Core fixes the type
  scale, spacing rhythm, and shell; a kickoff brings palette and custom blocks. Piano can
  be warm ivory and Astronomy near-black, and they are recognisably the same app.

Avoid: cards everywhere, gradients, neon, badges, streaks, dashboards, clutter.

**Motion is used in exactly three places**: the note change in the playground, the pause
state, and section entry on the kickoff page. Motion communicates *move your hands here* —
nothing else animates.

## 9. Accessibility

- Keyboard diagrams are non-interactive and expose `role="img"` with a descriptive label,
  rather than faking key semantics.
- Pause is a real `<button>`; the spacebar handler is an addition, never the only route.
- The playground announces the current note via a polite live region so the letter is not
  visual-only.
- Respect `prefers-reduced-motion`: transitions become instant; the timer still runs.

## 10. Out of scope today

Auth, accounts, progress, sessions, scoring, feedback, correctness checking, audio, MIDI,
camera, search UI, category UI, a second kickoff, a second exercise, dark mode, a backend,
and an admin CMS.

## 11. Definition of done

A person can open Kick Off, choose Piano, read a primer that genuinely explains how the
keyboard is laid out and how to place both hands, drop into a playground that shows them
one note at a time at a speed they chose, pause when they need to, and see what is coming
next — and walk away able to find any white key on a real piano and put both hands around
it.
