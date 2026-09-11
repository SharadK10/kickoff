# Kick Off — Piano Kickoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first complete Kick Off vertical slice — a Piano kickoff with a primer, a timed note playground, and a "what's next" section — on a core that knows nothing about piano.

**Architecture:** A frontend-only React app. Core owns the shell, discovery, block rendering, and the playground engine. A kickoff plugs in through two registries (block types, prompt types) plus a JSON content file; core treats every `type` string as opaque. Content is fetched at runtime from `/content/*.json` behind a single `contentSource` module so the swap to an HTTP API later touches one file.

**Tech Stack:** Node 24.21.0 · React 19.3 · TypeScript 5.9 · Vite 8.3 · React Router 7.18 · Tailwind CSS 4.3 · Motion 13.2 · Vitest 5.0 · Testing Library

**Spec:** `docs/superpowers/specs/2026-09-12-kick-off-piano.md`

## Global Constraints

- **Node 24.21.0.** Vitest 5 requires `^22.12 || ^24 || >=26`; the machine has 18.18.2. `nvm install 24` is Task 1, step 1. Every `npm`/`npx` command in this plan assumes Node 24 is active.
- **Exact versions:** `react@19.3.0`, `react-dom@19.3.0`, `react-router-dom@7.18.3`, `vite@8.3.0`, `@vitejs/plugin-react@6.1.1`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `motion@13.2.0`, `vitest@5.0.0`, `typescript@5.9.3`. Do **not** install `typescript@7` — it is the native port and too new for this toolchain.
- **No backend.** No Java, no Postgres, no server. If a task seems to need one, stop and ask.
- **Core must never contain the strings** `piano`, `note`, `keyboard`, `finger`, or `octave` outside of `src/kickoffs/`. This is verified in Task 11.
- **White keys only.** `C D E F G A B`. No sharps or flats anywhere in content or UI.
- **Product copy names the three sections exactly:** "The Idea", "The Playground", "What's Next". The word "exercise" may appear in content; the words "lesson", "course", "quiz", "score", "level", and "streak" must not appear anywhere.
- **Speeds are exactly:** Unhurried 8000ms (default) · Steady 5000ms · Brisk 3000ms. Default order is `RANDOM`.
- **The only playground control is pause**, bound to a button and the spacebar. No skip, next, restart, or reset.
- **Light theme only.** Do not add dark mode.
- **Commit after every task.** Conventional commit messages.

> **Amendment, mid-execution (2026-09-12):** by explicit user direction, automated testing is dropped for the remainder of this plan. Tasks 1-6 were built test-first as written below; a dedicated task then deleted every test file and all test tooling (Vitest, Testing Library, jsdom) from the project. **Every "Test:" file target and TDD step (write failing test / run to verify it fails / run to verify it passes) below, in every task, is void from that point forward** — left in place only as a record of how the first six tasks were actually built. Tasks 7 onward are implemented directly from the given component/hook code and verified by `npm run build` plus the manual walkthrough in Task 11. See the plan's ledger for the ruling and its cost.

---

## File Structure

```
kickoff/
├── .gitignore
├── README.md
├── docs/superpowers/{specs,plans}/
└── frontend/
    ├── .nvmrc                              node version pin
    ├── index.html                          Google Fonts, root div
    ├── vite.config.ts                      vite + tailwind + vitest config
    ├── public/content/
    │   ├── index.json                      the shelf
    │   └── piano.json                      the Piano kickoff, all content
    └── src/
        ├── main.tsx                        entry; imports kickoffs before render
        ├── test/setup.ts                   jest-dom + cleanup
        ├── styles/index.css                tailwind import + design tokens
        ├── types/content.ts                every content type, one file
        ├── services/contentSource.ts       THE swap point for a future backend
        ├── app/
        │   ├── router.tsx                  routes + loaders
        │   └── routes/
        │       ├── HomeRoute.tsx           the shelf
        │       ├── KickoffRoute.tsx        assembles the three sections
        │       └── RouteError.tsx          loader/render error UI
        ├── core/                           ← knows nothing about piano
        │   ├── blocks/
        │   │   ├── registry.ts             block type → component
        │   │   ├── BlockRenderer.tsx       renders a Block[], skips unknowns
        │   │   ├── Prose.tsx
        │   │   ├── KeyIdea.tsx
        │   │   └── index.ts                registers core blocks
        │   ├── playground/
        │   │   ├── nextIndex.ts            pure advance logic
        │   │   ├── usePlayground.ts        timer + order + pause state
        │   │   ├── promptRegistry.ts       prompt type → component
        │   │   ├── TimingLine.tsx          CSS-animated, pausable
        │   │   ├── PlaygroundControls.tsx  speed, order, pause
        │   │   └── Playground.tsx          the surface
        │   ├── shell/Shell.tsx             wordmark + page frame
        │   ├── theme/KickoffTheme.tsx      per-kickoff CSS variables
        │   └── ui/Section.tsx              section heading + rhythm
        └── kickoffs/
            ├── index.ts                    imports every kickoff
            └── piano/
                ├── index.ts                registers piano's blocks + prompt
                ├── PianoKeyboard.tsx       reusable keyboard diagram
                ├── KeyboardBlock.tsx       KEYBOARD block adapter
                ├── HandRuleBlock.tsx       HAND_RULE block
                └── NoteLetterPrompt.tsx    NOTE_LETTER prompt renderer
```

---

## Task 1: Repository, toolchain, and app skeleton

**Files:**
- Create: `.gitignore`, `README.md`, `frontend/.nvmrc`, `frontend/vite.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/styles/index.css`, `frontend/index.html`, `frontend/src/App.tsx`, `frontend/src/main.tsx`
- Test: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm run dev` and `npm test` in `frontend/`; Tailwind tokens `--color-surface`, `--color-surface-raised`, `--color-ink`, `--color-ink-muted`, `--color-ink-faint`, `--color-line`, `--color-accent`, and fonts `--font-display`, `--font-sans`.

- [ ] **Step 1: Install Node 24 and initialise the repo**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
source ~/.nvm/nvm.sh
nvm install 24
nvm use 24
node -v        # expect v24.x
git init
```

- [ ] **Step 2: Scaffold the Vite app**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
npm create vite@latest frontend -- --template react-ts
cd frontend
echo "24" > .nvmrc
npm install
npm install react@19.3.0 react-dom@19.3.0 react-router-dom@7.18.3 motion@13.2.0
npm install -D tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 vitest@5.0.0 jsdom@30.0.1 \
  @testing-library/react@16.3.3 @testing-library/dom@10.4.1 @testing-library/jest-dom@7.0.1 \
  @testing-library/user-event@14.6.7 typescript@5.9.3
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 4: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 5: Write `src/styles/index.css` with the design tokens**

Delete `src/App.css` and `src/index.css`.

```css
@import "tailwindcss";

@theme {
  --font-display: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  --color-surface: #fbf8f4;
  --color-surface-raised: #f4efe8;
  --color-ink: #1c1815;
  --color-ink-muted: #6b6259;
  --color-ink-faint: #a79d92;
  --color-line: #e6dfd5;
  --color-accent: #b4622a;
}

html {
  background-color: var(--color-surface);
}

body {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kick Off</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write the failing test**

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Kick Off wordmark', () => {
    render(<App />)
    expect(screen.getByText('Kick Off')).toBeInTheDocument()
  })
})
```

- [ ] **Step 8: Run the test and watch it fail**

Add `"test": "vitest run"` and `"test:watch": "vitest"` to the `scripts` block of `package.json`, then:

Run: `npm test`
Expected: FAIL — `App` still renders the Vite starter markup, so `getByText('Kick Off')` throws "Unable to find an element with the text: Kick Off".

- [ ] **Step 9: Write the minimal implementation**

`src/App.tsx`:

```tsx
export default function App() {
  return <h1>Kick Off</h1>
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Delete `src/assets/` and any leftover starter files.

- [ ] **Step 10: Run the test and verify it passes**

Run: `npm test`
Expected: PASS, 1 test.

Also run `npm run build` — expected: succeeds with no TypeScript errors.

- [ ] **Step 11: Write `.gitignore` and `README.md` at the repo root**

`.gitignore`:

```
node_modules/
dist/
.DS_Store
*.local
.vite/
```

`README.md`:

```markdown
# Kick Off

Kick Off gets people started learning something.

Not a course, not a curriculum. You arrive, learn the one idea that unlocks a
subject, mess around with it until it sticks, and leave. Nothing is tracked,
scored, or gated.

The first kickoff is **Piano**.

## Run it

```bash
cd frontend
nvm use          # Node 24
npm install
npm run dev
```

## Test it

```bash
cd frontend
npm test
```

## Design

- Spec: `docs/superpowers/specs/2026-09-12-kick-off-piano.md`
- Plan: `docs/superpowers/plans/2026-09-12-kick-off-piano.md`
```

- [ ] **Step 12: Commit**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
git add -A
git commit -m "chore: scaffold Kick Off frontend with Vite, Tailwind v4, and Vitest"
```

---

## Task 2: Content types and the content source

**Files:**
- Create: `frontend/src/types/content.ts`, `frontend/src/services/contentSource.ts`
- Test: `frontend/src/services/contentSource.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: types `Block`, `Speed`, `Order`, `PlaygroundConfig`, `NextItem`, `KickoffSummary`, `Kickoff`; functions `loadShelf(): Promise<KickoffSummary[]>` and `loadKickoff(slug: string): Promise<Kickoff>`.

- [ ] **Step 1: Write `src/types/content.ts`**

```ts
/** A unit of primer content. `type` is opaque to core — a kickoff registers a renderer for it. */
export type Block = { type: string } & Record<string, unknown>

export type Speed = { label: string; ms: number }

export type Order = 'RANDOM' | 'SEQUENTIAL'

export type PlaygroundConfig = {
  /** Opaque to core. A kickoff registers a prompt renderer for this string. */
  promptType: string
  items: string[]
  order: Order
  speeds: Speed[]
  defaultSpeedLabel: string
  instruction: string
}

export type NextItem = {
  number: string
  title: string
  description: string
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

export type Kickoff = KickoffSummary & {
  exerciseNumber: string
  exerciseTitle: string
  idea: Block[]
  playground: PlaygroundConfig
  whatsNext: NextItem[]
}
```

- [ ] **Step 2: Write the failing test**

`src/services/contentSource.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadKickoff, loadShelf } from './contentSource'

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadShelf', () => {
  it('fetches the shelf index', async () => {
    const fetchMock = mockFetch(200, [{ slug: 'piano' }])
    const shelf = await loadShelf()
    expect(fetchMock).toHaveBeenCalledWith('/content/index.json')
    expect(shelf).toEqual([{ slug: 'piano' }])
  })

  it('throws a readable error when the shelf is missing', async () => {
    mockFetch(404, null)
    await expect(loadShelf()).rejects.toThrow('Could not load /content/index.json (404)')
  })
})

describe('loadKickoff', () => {
  it('fetches a kickoff by slug', async () => {
    const fetchMock = mockFetch(200, { slug: 'piano', title: 'Piano' })
    const kickoff = await loadKickoff('piano')
    expect(fetchMock).toHaveBeenCalledWith('/content/piano.json')
    expect(kickoff.title).toBe('Piano')
  })

  it('throws a readable error for an unknown slug', async () => {
    mockFetch(404, null)
    await expect(loadKickoff('banjo')).rejects.toThrow('Could not load /content/banjo.json (404)')
  })
})
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npm test -- contentSource`
Expected: FAIL — "Failed to resolve import './contentSource'".

- [ ] **Step 4: Write the implementation**

`src/services/contentSource.ts`:

```ts
import type { Kickoff, KickoffSummary } from '../types/content'

/**
 * The single seam between Kick Off and wherever content lives.
 * Today that is static JSON in `public/content`. If a backend is ever needed,
 * only BASE and the two paths below change — nothing else in the app moves.
 */
const BASE = '/content'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`)
  }
  return (await response.json()) as T
}

export function loadShelf(): Promise<KickoffSummary[]> {
  return getJson<KickoffSummary[]>(`${BASE}/index.json`)
}

export function loadKickoff(slug: string): Promise<Kickoff> {
  return getJson<Kickoff>(`${BASE}/${slug}.json`)
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- contentSource`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types frontend/src/services
git commit -m "feat: add content types and the content source seam"
```

---

## Task 3: The Piano content files

**Files:**
- Create: `frontend/public/content/index.json`, `frontend/public/content/piano.json`
- Test: `frontend/src/services/content.contract.test.ts`

**Interfaces:**
- Consumes: types from Task 2.
- Produces: the shelf listing one LIVE kickoff at slug `piano`; `piano.json` containing 11 `idea` blocks of types `PROSE`, `KEY_IDEA`, `KEYBOARD`, `HAND_RULE`, a `playground` with `promptType: "NOTE_LETTER"`, and 3 `whatsNext` items.

- [ ] **Step 1: Write the failing contract test**

This test reads the real files from disk, so it fails if the served content ever drifts from the types.

`src/services/content.contract.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Kickoff, KickoffSummary } from '../types/content'

function readContent<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(import.meta.dirname, '../../public/content', file), 'utf8')) as T
}

describe('shelf index', () => {
  it('lists piano as a live kickoff', () => {
    const shelf = readContent<KickoffSummary[]>('index.json')
    expect(shelf).toHaveLength(1)
    expect(shelf[0]).toMatchObject({ slug: 'piano', title: 'Piano', category: 'Music', status: 'LIVE' })
    expect(shelf[0].accent).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('piano kickoff', () => {
  const piano = readContent<Kickoff>('piano.json')

  it('has the identity the shelf promises', () => {
    expect(piano.slug).toBe('piano')
    expect(piano.exerciseNumber).toBe('01')
    expect(piano.exerciseTitle).toBe('Find your hand position')
  })

  it('only uses block types that piano or core will register', () => {
    const known = new Set(['PROSE', 'KEY_IDEA', 'KEYBOARD', 'HAND_RULE'])
    for (const block of piano.idea) {
      expect(known.has(block.type)).toBe(true)
    }
  })

  it('teaches with at least one keyboard diagram and the hand rule', () => {
    const types = piano.idea.map((block) => block.type)
    expect(types).toContain('KEYBOARD')
    expect(types).toContain('HAND_RULE')
    expect(types.filter((t) => t === 'KEY_IDEA')).toHaveLength(2)
  })

  it('configures the playground with the seven white keys', () => {
    expect(piano.playground.promptType).toBe('NOTE_LETTER')
    expect(piano.playground.items).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(piano.playground.order).toBe('RANDOM')
  })

  it('offers exactly the three agreed speeds and defaults to the slowest', () => {
    expect(piano.playground.speeds).toEqual([
      { label: 'Unhurried', ms: 8000 },
      { label: 'Steady', ms: 5000 },
      { label: 'Brisk', ms: 3000 },
    ])
    expect(piano.playground.defaultSpeedLabel).toBe('Unhurried')
  })

  it('names three things that come next', () => {
    expect(piano.whatsNext).toHaveLength(3)
    for (const item of piano.whatsNext) {
      expect(item.number).toMatch(/^0[2-4]$/)
      expect(item.title.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
    }
  })

  it('never mentions sharps or flats', () => {
    const text = JSON.stringify(piano)
    expect(text).not.toMatch(/\b(sharp|sharps|flat|flats)\b/i)
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- content.contract`
Expected: FAIL — `ENOENT: no such file or directory ... public/content/index.json`.

- [ ] **Step 3: Write `public/content/index.json`**

```json
[
  {
    "slug": "piano",
    "title": "Piano",
    "tagline": "Find your way around the keys.",
    "category": "Music",
    "accent": "#b4622a",
    "status": "LIVE"
  }
]
```

- [ ] **Step 4: Write `public/content/piano.json`**

```json
{
  "slug": "piano",
  "title": "Piano",
  "tagline": "Find your way around the keys.",
  "category": "Music",
  "accent": "#b4622a",
  "status": "LIVE",
  "exerciseNumber": "01",
  "exerciseTitle": "Find your hand position",
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
  "playground": {
    "promptType": "NOTE_LETTER",
    "items": ["C", "D", "E", "F", "G", "A", "B"],
    "order": "RANDOM",
    "speeds": [
      { "label": "Unhurried", "ms": 8000 },
      { "label": "Steady", "ms": 5000 },
      { "label": "Brisk", "ms": 3000 }
    ],
    "defaultSpeedLabel": "Unhurried",
    "instruction": "Right thumb on the note. Left pinky on the same note, an octave down."
  },
  "whatsNext": [
    {
      "number": "02",
      "title": "Name the note",
      "description": "See a key, know what it is called — without counting up from C every time."
    },
    {
      "number": "03",
      "title": "Keep time",
      "description": "Play a steady beat and stay inside it, which is harder and more useful than it sounds."
    },
    {
      "number": "04",
      "title": "Your first chord",
      "description": "Three notes at once, using the hand shape you already know."
    }
  ]
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- content.contract`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/public/content frontend/src/services/content.contract.test.ts
git commit -m "feat: author the Piano kickoff content"
```

---
## Task 4: The block registry and core blocks

**Files:**
- Create: `frontend/src/core/blocks/registry.ts`, `frontend/src/core/blocks/BlockRenderer.tsx`, `frontend/src/core/blocks/Prose.tsx`, `frontend/src/core/blocks/KeyIdea.tsx`, `frontend/src/core/blocks/index.ts`
- Test: `frontend/src/core/blocks/BlockRenderer.test.tsx`

**Interfaces:**
- Consumes: `Block` from `src/types/content.ts`.
- Produces: `type BlockComponent = ComponentType<{ block: Block }>`; `registerBlocks(entries: Record<string, BlockComponent>): void`; `getBlockComponent(type: string): BlockComponent | undefined`; `<BlockRenderer blocks={Block[]} />`. Importing `src/core/blocks/index.ts` registers `PROSE` and `KEY_IDEA` as a side effect.

- [ ] **Step 1: Write the failing test**

`src/core/blocks/BlockRenderer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BlockRenderer } from './BlockRenderer'
import { registerBlocks } from './registry'
import './index'

registerBlocks({
  TEST_BLOCK: ({ block }) => <span data-testid="test-block">{String(block.label)}</span>,
})

describe('BlockRenderer', () => {
  it('renders a registered block with its component', () => {
    render(<BlockRenderer blocks={[{ type: 'TEST_BLOCK', label: 'hello' }]} />)
    expect(screen.getByTestId('test-block')).toHaveTextContent('hello')
  })

  it('renders every block in order', () => {
    render(
      <BlockRenderer
        blocks={[
          { type: 'PROSE', text: 'first' },
          { type: 'KEY_IDEA', text: 'second' },
        ]}
      />,
    )
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('skips an unknown block type instead of crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <BlockRenderer
        blocks={[{ type: 'SKY_CHART', text: 'from a kickoff that is not loaded' }, { type: 'PROSE', text: 'still here' }]}
      />,
    )
    expect(screen.queryByText('from a kickoff that is not loaded')).not.toBeInTheDocument()
    expect(screen.getByText('still here')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('Kick Off: no renderer registered for block type "SKY_CHART"')
    warn.mockRestore()
  })
})

describe('core blocks', () => {
  it('renders PROSE text', () => {
    render(<BlockRenderer blocks={[{ type: 'PROSE', text: 'a paragraph' }]} />)
    expect(screen.getByText('a paragraph')).toBeInTheDocument()
  })

  it('renders KEY_IDEA text', () => {
    render(<BlockRenderer blocks={[{ type: 'KEY_IDEA', text: 'the one thing' }]} />)
    expect(screen.getByText('the one thing')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- BlockRenderer`
Expected: FAIL — "Failed to resolve import './BlockRenderer'".

- [ ] **Step 3: Write `src/core/blocks/registry.ts`**

```ts
import type { ComponentType } from 'react'
import type { Block } from '../../types/content'

export type BlockComponent = ComponentType<{ block: Block }>

const registry = new Map<string, BlockComponent>()

/** A kickoff calls this at import time to plug its own block types into core. */
export function registerBlocks(entries: Record<string, BlockComponent>): void {
  for (const [type, component] of Object.entries(entries)) {
    registry.set(type, component)
  }
}

export function getBlockComponent(type: string): BlockComponent | undefined {
  return registry.get(type)
}
```

- [ ] **Step 4: Write `src/core/blocks/BlockRenderer.tsx`**

```tsx
import type { Block } from '../../types/content'
import { getBlockComponent } from './registry'

/**
 * Renders primer content. Core never inspects what a block means — it looks the
 * type up in the registry and hands the block over. An unregistered type is
 * skipped rather than allowed to take the page down.
 */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, position) => {
        const Component = getBlockComponent(block.type)
        if (!Component) {
          console.warn(`Kick Off: no renderer registered for block type "${block.type}"`)
          return null
        }
        return <Component key={position} block={block} />
      })}
    </>
  )
}
```

- [ ] **Step 5: Write the two core block components**

`src/core/blocks/Prose.tsx`:

```tsx
import type { Block } from '../../types/content'

export function Prose({ block }: { block: Block }) {
  return (
    <p className="max-w-[58ch] text-lg leading-relaxed text-ink-muted sm:text-xl sm:leading-relaxed">
      {String(block.text ?? '')}
    </p>
  )
}
```

`src/core/blocks/KeyIdea.tsx`:

```tsx
import type { Block } from '../../types/content'

export function KeyIdea({ block }: { block: Block }) {
  return (
    <p className="max-w-[46ch] border-l-2 border-accent py-1 pl-6 font-display text-2xl leading-snug text-ink sm:text-[2rem]">
      {String(block.text ?? '')}
    </p>
  )
}
```

- [ ] **Step 6: Write `src/core/blocks/index.ts`**

```ts
import { KeyIdea } from './KeyIdea'
import { Prose } from './Prose'
import { registerBlocks } from './registry'

registerBlocks({
  PROSE: Prose,
  KEY_IDEA: KeyIdea,
})

export { BlockRenderer } from './BlockRenderer'
export { getBlockComponent, registerBlocks } from './registry'
export type { BlockComponent } from './registry'
```

- [ ] **Step 7: Run the test and verify it passes**

Run: `npm test -- BlockRenderer`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/core/blocks
git commit -m "feat: add the block registry and core block renderers"
```

---

## Task 5: The playground engine

**Files:**
- Create: `frontend/src/core/playground/nextIndex.ts`, `frontend/src/core/playground/usePlayground.ts`
- Test: `frontend/src/core/playground/nextIndex.test.ts`, `frontend/src/core/playground/usePlayground.test.ts`

**Interfaces:**
- Consumes: `Order`, `PlaygroundConfig`, `Speed` from `src/types/content.ts`.
- Produces: `nextIndex(itemCount: number, currentIndex: number, order: Order, random?: () => number): number`; `usePlayground(config: PlaygroundConfig): PlaygroundController` where `PlaygroundController = { current: string; index: number; isPaused: boolean; speed: Speed; speeds: Speed[]; order: Order; togglePause: () => void; chooseSpeed: (label: string) => void; chooseOrder: (order: Order) => void }`.

- [ ] **Step 1: Write the failing test for the pure advance logic**

`src/core/playground/nextIndex.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { nextIndex } from './nextIndex'

describe('nextIndex in SEQUENTIAL order', () => {
  it('walks forward one at a time', () => {
    expect(nextIndex(7, 0, 'SEQUENTIAL')).toBe(1)
    expect(nextIndex(7, 3, 'SEQUENTIAL')).toBe(4)
  })

  it('wraps around at the end', () => {
    expect(nextIndex(7, 6, 'SEQUENTIAL')).toBe(0)
  })
})

describe('nextIndex in RANDOM order', () => {
  it('never returns the current index, whatever the random value', () => {
    for (const value of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999999]) {
      for (let current = 0; current < 7; current += 1) {
        expect(nextIndex(7, current, 'RANDOM', () => value)).not.toBe(current)
      }
    }
  })

  it('maps the lowest random value to the next item', () => {
    expect(nextIndex(7, 2, 'RANDOM', () => 0)).toBe(3)
  })

  it('maps the highest random value to the previous item', () => {
    expect(nextIndex(7, 2, 'RANDOM', () => 0.999999)).toBe(1)
  })

  it('can reach every other index', () => {
    const reached = new Set<number>()
    for (let step = 0; step < 6; step += 1) {
      reached.add(nextIndex(7, 0, 'RANDOM', () => step / 6))
    }
    expect([...reached].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('nextIndex edge cases', () => {
  it('stays at 0 for a single item', () => {
    expect(nextIndex(1, 0, 'RANDOM')).toBe(0)
    expect(nextIndex(1, 0, 'SEQUENTIAL')).toBe(0)
  })

  it('stays at 0 for an empty list', () => {
    expect(nextIndex(0, 0, 'RANDOM')).toBe(0)
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- nextIndex`
Expected: FAIL — "Failed to resolve import './nextIndex'".

- [ ] **Step 3: Write `src/core/playground/nextIndex.ts`**

```ts
import type { Order } from '../../types/content'

/**
 * Chooses the next prompt index.
 *
 * RANDOM picks an offset of 1..n-1 rather than an absolute index, which
 * guarantees the same prompt never appears twice in a row and — unlike a
 * retry loop — always terminates.
 */
export function nextIndex(
  itemCount: number,
  currentIndex: number,
  order: Order,
  random: () => number = Math.random,
): number {
  if (itemCount <= 1) return 0
  if (order === 'SEQUENTIAL') return (currentIndex + 1) % itemCount
  const offset = 1 + Math.floor(random() * (itemCount - 1))
  return (currentIndex + offset) % itemCount
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- nextIndex`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the failing test for the hook**

`src/core/playground/usePlayground.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaygroundConfig } from '../../types/content'
import { usePlayground } from './usePlayground'

const config: PlaygroundConfig = {
  promptType: 'TEST_PROMPT',
  items: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  order: 'SEQUENTIAL',
  speeds: [
    { label: 'Unhurried', ms: 8000 },
    { label: 'Steady', ms: 5000 },
    { label: 'Brisk', ms: 3000 },
  ],
  defaultSpeedLabel: 'Unhurried',
  instruction: 'do the thing',
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePlayground', () => {
  it('starts on the first item at the configured default speed', () => {
    const { result } = renderHook(() => usePlayground(config))
    expect(result.current.current).toBe('C')
    expect(result.current.speed.label).toBe('Unhurried')
    expect(result.current.isPaused).toBe(false)
  })

  it('falls back to the first speed when the default label is unknown', () => {
    const { result } = renderHook(() => usePlayground({ ...config, defaultSpeedLabel: 'Sluggish' }))
    expect(result.current.speed.label).toBe('Unhurried')
  })

  it('advances once the speed interval elapses', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('D')
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('E')
  })

  it('does not advance before the interval elapses', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { vi.advanceTimersByTime(7999) })
    expect(result.current.current).toBe('C')
  })

  it('stops advancing while paused and resumes afterwards', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.togglePause() })
    expect(result.current.isPaused).toBe(true)
    act(() => { vi.advanceTimersByTime(40000) })
    expect(result.current.current).toBe('C')

    act(() => { result.current.togglePause() })
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.current).toBe('D')
  })

  it('uses the new interval after the speed changes', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.chooseSpeed('Brisk') })
    expect(result.current.speed.ms).toBe(3000)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.current).toBe('D')
  })

  it('ignores an unknown speed label', () => {
    const { result } = renderHook(() => usePlayground(config))
    act(() => { result.current.chooseSpeed('Warp') })
    expect(result.current.speed.label).toBe('Unhurried')
  })

  it('never repeats the current item in RANDOM order', () => {
    const { result } = renderHook(() => usePlayground({ ...config, order: 'RANDOM' }))
    let previous = result.current.current
    for (let step = 0; step < 30; step += 1) {
      act(() => { vi.advanceTimersByTime(8000) })
      expect(result.current.current).not.toBe(previous)
      previous = result.current.current
    }
  })

  it('switches order on demand', () => {
    const { result } = renderHook(() => usePlayground({ ...config, order: 'RANDOM' }))
    act(() => { result.current.chooseOrder('SEQUENTIAL') })
    expect(result.current.order).toBe('SEQUENTIAL')
    const startIndex = result.current.index
    act(() => { vi.advanceTimersByTime(8000) })
    expect(result.current.index).toBe((startIndex + 1) % config.items.length)
  })
})
```

- [ ] **Step 6: Run the test and watch it fail**

Run: `npm test -- usePlayground`
Expected: FAIL — "Failed to resolve import './usePlayground'".

- [ ] **Step 7: Write `src/core/playground/usePlayground.ts`**

```ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Order, PlaygroundConfig, Speed } from '../../types/content'
import { nextIndex } from './nextIndex'

export type PlaygroundController = {
  current: string
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
 * what the items mean — they are opaque strings supplied by a kickoff.
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

  useEffect(() => {
    if (isPaused || itemCount === 0) return
    const timer = window.setInterval(() => {
      setIndex((current) => nextIndex(itemCount, current, order))
    }, speed.ms)
    return () => window.clearInterval(timer)
  }, [isPaused, itemCount, order, speed.ms])

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
    current: config.items[index] ?? '',
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

- [ ] **Step 8: Run the test and verify it passes**

Run: `npm test -- usePlayground`
Expected: PASS, 9 tests.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/core/playground
git commit -m "feat: add the playground engine with order, speed, and pause"
```

---

## Task 6: The playground surface

**Files:**
- Create: `frontend/src/core/playground/promptRegistry.ts`, `frontend/src/core/playground/TimingLine.tsx`, `frontend/src/core/playground/PlaygroundControls.tsx`, `frontend/src/core/playground/Playground.tsx`
- Modify: `frontend/src/styles/index.css` (append the `kickoff-timing` keyframes)
- Test: `frontend/src/core/playground/Playground.test.tsx`

**Interfaces:**
- Consumes: `usePlayground`, `PlaygroundController` from Task 5; `PlaygroundConfig`, `Speed`, `Order` from Task 2.
- Produces: `type PromptComponent = ComponentType<{ prompt: string }>`; `registerPrompts(entries: Record<string, PromptComponent>): void`; `getPromptComponent(type: string): PromptComponent | undefined`; `<Playground config={PlaygroundConfig} />`.

- [ ] **Step 1: Write the failing test**

`src/core/playground/Playground.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaygroundConfig } from '../../types/content'
import { Playground } from './Playground'
import { registerPrompts } from './promptRegistry'

registerPrompts({
  TEST_PROMPT: ({ prompt }) => <span data-testid="prompt">{prompt}</span>,
})

const config: PlaygroundConfig = {
  promptType: 'TEST_PROMPT',
  items: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  order: 'SEQUENTIAL',
  speeds: [
    { label: 'Unhurried', ms: 8000 },
    { label: 'Steady', ms: 5000 },
    { label: 'Brisk', ms: 3000 },
  ],
  defaultSpeedLabel: 'Unhurried',
  instruction: 'Right thumb on the note.',
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function setup() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<Playground config={config} />)
  return user
}

describe('Playground', () => {
  it('shows the kickoff instruction and the first prompt', () => {
    setup()
    expect(screen.getByText('Right thumb on the note.')).toBeInTheDocument()
    expect(screen.getByTestId('prompt')).toHaveTextContent('C')
  })

  it('announces the prompt politely for screen readers', () => {
    setup()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders nothing for an unregistered prompt type without crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Playground config={{ ...config, promptType: 'STAR_CHART' }} />)
    expect(screen.queryByTestId('prompt')).not.toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('Kick Off: no renderer registered for prompt type "STAR_CHART"')
    warn.mockRestore()
  })

  it('advances the prompt on the timer', () => {
    setup()
    vi.advanceTimersByTime(8000)
    expect(screen.getByTestId('prompt')).toHaveTextContent('D')
  })

  it('pauses and resumes from the button', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: /pause/i }))
    vi.advanceTimersByTime(24000)
    expect(screen.getByTestId('prompt')).toHaveTextContent('C')

    await user.click(screen.getByRole('button', { name: /resume/i }))
    vi.advanceTimersByTime(8000)
    expect(screen.getByTestId('prompt')).toHaveTextContent('D')
  })

  it('pauses from the spacebar', async () => {
    const user = setup()
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    vi.advanceTimersByTime(24000)
    expect(screen.getByTestId('prompt')).toHaveTextContent('C')
  })

  it('does not double-toggle when the spacebar activates the focused pause button', async () => {
    const user = setup()
    const pauseButton = screen.getByRole('button', { name: /pause/i })
    pauseButton.focus()
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
  })

  it('changes the speed', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Brisk' }))
    vi.advanceTimersByTime(3000)
    expect(screen.getByTestId('prompt')).toHaveTextContent('D')
  })

  it('changes the order', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Shuffled' }))
    expect(screen.getByRole('button', { name: 'Shuffled' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'In order' })).toHaveAttribute('aria-pressed', 'false')
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- Playground`
Expected: FAIL — "Failed to resolve import './Playground'".

- [ ] **Step 3: Write `src/core/playground/promptRegistry.ts`**

```ts
import type { ComponentType } from 'react'

export type PromptComponent = ComponentType<{ prompt: string }>

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

- [ ] **Step 4: Append the keyframes to `src/styles/index.css`**

```css
@keyframes kickoff-timing {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

- [ ] **Step 5: Write `src/core/playground/TimingLine.tsx`**

```tsx
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
```

- [ ] **Step 6: Write `src/core/playground/PlaygroundControls.tsx`**

```tsx
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
```

- [ ] **Step 7: Write `src/core/playground/Playground.tsx`**

```tsx
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
```

- [ ] **Step 8: Run the test and verify it passes**

Run: `npm test -- Playground`
Expected: PASS, 9 tests.

If `aria-pressed:` variants are unavailable, replace the `SEGMENT` string with a function that returns the active/inactive classes from the same boolean, and keep the `aria-pressed` attribute — the test asserts the attribute, not the class.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/core/playground frontend/src/styles/index.css
git commit -m "feat: add the playground surface with prompt registry and pause"
```

---
## Task 7: The reusable piano keyboard

**Files:**
- Create: `frontend/src/kickoffs/piano/PianoKeyboard.tsx`
- Test: `frontend/src/kickoffs/piano/PianoKeyboard.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `<PianoKeyboard octaves={number} labels={'none' | 'c-only' | 'all'} highlight={string[]} ariaLabel={string} />`. White keys carry `data-white-key` and `data-note`; highlighted ones also carry `data-highlighted`. Black keys carry `data-black-key` and are `aria-hidden`.

- [ ] **Step 1: Write the failing test**

`src/kickoffs/piano/PianoKeyboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PianoKeyboard } from './PianoKeyboard'

function keys(container: HTMLElement) {
  return {
    white: [...container.querySelectorAll('[data-white-key]')],
    black: [...container.querySelectorAll('[data-black-key]')],
    highlighted: [...container.querySelectorAll('[data-highlighted]')],
  }
}

describe('PianoKeyboard', () => {
  it('draws seven white keys and five black keys per octave', () => {
    const { container } = render(<PianoKeyboard octaves={1} ariaLabel="one octave" />)
    const { white, black } = keys(container)
    expect(white).toHaveLength(7)
    expect(black).toHaveLength(5)
  })

  it('scales to any number of octaves', () => {
    const { container } = render(<PianoKeyboard octaves={3} ariaLabel="three octaves" />)
    const { white, black } = keys(container)
    expect(white).toHaveLength(21)
    expect(black).toHaveLength(15)
  })

  it('defaults to two octaves', () => {
    const { container } = render(<PianoKeyboard ariaLabel="default" />)
    expect(keys(container).white).toHaveLength(14)
  })

  it('lays the white keys out as C D E F G A B, repeating', () => {
    const { container } = render(<PianoKeyboard octaves={2} ariaLabel="two octaves" />)
    const notes = keys(container).white.map((key) => key.getAttribute('data-note'))
    expect(notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('shows no labels by default', () => {
    render(<PianoKeyboard octaves={1} ariaLabel="unlabelled" />)
    expect(screen.queryByText('C')).not.toBeInTheDocument()
  })

  it('labels only C when asked', () => {
    render(<PianoKeyboard octaves={2} labels="c-only" ariaLabel="c only" />)
    expect(screen.getAllByText('C')).toHaveLength(2)
    expect(screen.queryByText('D')).not.toBeInTheDocument()
  })

  it('labels every white key when asked', () => {
    render(<PianoKeyboard octaves={1} labels="all" ariaLabel="all labelled" />)
    for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      expect(screen.getByText(note)).toBeInTheDocument()
    }
  })

  it('highlights every occurrence of a requested note', () => {
    const { container } = render(<PianoKeyboard octaves={2} highlight={['C']} ariaLabel="highlighted" />)
    const highlighted = keys(container).highlighted
    expect(highlighted).toHaveLength(2)
    expect(highlighted.every((key) => key.getAttribute('data-note') === 'C')).toBe(true)
  })

  it('is a labelled image, not a set of fake controls', () => {
    render(<PianoKeyboard octaves={1} ariaLabel="A piano keyboard showing one octave." />)
    expect(screen.getByRole('img', { name: 'A piano keyboard showing one octave.' })).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('hides the black keys from assistive technology', () => {
    const { container } = render(<PianoKeyboard octaves={1} ariaLabel="one octave" />)
    expect(keys(container).black.every((key) => key.getAttribute('aria-hidden') === 'true')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- PianoKeyboard`
Expected: FAIL — "Failed to resolve import './PianoKeyboard'".

- [ ] **Step 3: Write `src/kickoffs/piano/PianoKeyboard.tsx`**

```tsx
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** White-key positions within an octave that have a black key above and to the right. */
const BLACK_KEY_OFFSETS = [0, 1, 3, 4, 5] as const

export type PianoKeyboardProps = {
  octaves?: number
  labels?: 'none' | 'c-only' | 'all'
  highlight?: string[]
  ariaLabel: string
}

export function PianoKeyboard({ octaves = 2, labels = 'none', highlight = [], ariaLabel }: PianoKeyboardProps) {
  const totalWhite = octaves * 7
  const whiteKeys = Array.from({ length: totalWhite }, (_, position) => WHITE_NOTES[position % 7])

  const blackKeys: number[] = []
  for (let octave = 0; octave < octaves; octave += 1) {
    for (const offset of BLACK_KEY_OFFSETS) {
      blackKeys.push(octave * 7 + offset)
    }
  }

  const highlighted = new Set(highlight)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative flex h-32 w-full select-none overflow-hidden rounded-md border border-ink/20 bg-white sm:h-44"
      style={{ ['--total-white' as string]: String(totalWhite) }}
    >
      {whiteKeys.map((note, position) => {
        const isHighlighted = highlighted.has(note)
        const showLabel = labels === 'all' || (labels === 'c-only' && note === 'C')
        return (
          <div
            key={position}
            data-white-key=""
            data-note={note}
            data-highlighted={isHighlighted ? '' : undefined}
            className={[
              'flex flex-1 items-end justify-center border-r border-ink/10 pb-2 last:border-r-0',
              isHighlighted ? 'bg-accent/10' : '',
            ].join(' ')}
          >
            {showLabel ? (
              <span
                className={[
                  'text-[0.7rem] sm:text-sm',
                  isHighlighted ? 'font-medium text-accent' : 'text-ink-faint',
                ].join(' ')}
              >
                {note}
              </span>
            ) : null}
          </div>
        )
      })}

      {blackKeys.map((whitePosition) => (
        <div
          key={whitePosition}
          data-black-key=""
          aria-hidden="true"
          className="absolute top-0 h-[62%] -translate-x-1/2 rounded-b-[3px] bg-ink"
          style={{
            left: `calc(100% / var(--total-white) * ${whitePosition + 1})`,
            width: 'calc(100% / var(--total-white) * 0.58)',
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- PianoKeyboard`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/kickoffs/piano
git commit -m "feat: add the reusable piano keyboard diagram"
```

---

## Task 8: The Piano kickoff module

**Files:**
- Create: `frontend/src/kickoffs/piano/handPosition.ts`, `frontend/src/kickoffs/piano/KeyboardBlock.tsx`, `frontend/src/kickoffs/piano/HandRuleBlock.tsx`, `frontend/src/kickoffs/piano/NoteLetterPrompt.tsx`, `frontend/src/kickoffs/piano/index.ts`, `frontend/src/kickoffs/index.ts`
- Test: `frontend/src/kickoffs/piano/handPosition.test.ts`, `frontend/src/kickoffs/piano/pianoBlocks.test.tsx`

**Interfaces:**
- Consumes: `registerBlocks` from `src/core/blocks`, `registerPrompts` from `src/core/playground/promptRegistry`, `PianoKeyboard` from Task 7, `Block` from Task 2.
- Produces: `fiveFingerNotes(start: string): string[]`. Importing `src/kickoffs/index.ts` registers core blocks plus `KEYBOARD`, `HAND_RULE`, and the `NOTE_LETTER` prompt.

- [ ] **Step 1: Write the failing test for the hand-position rule**

This is the one piece of genuine piano domain logic in the app, so it is tested exhaustively.

`src/kickoffs/piano/handPosition.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fiveFingerNotes } from './handPosition'

describe('fiveFingerNotes', () => {
  it('returns the note plus the next four white keys', () => {
    expect(fiveFingerNotes('C')).toEqual(['C', 'D', 'E', 'F', 'G'])
    expect(fiveFingerNotes('F')).toEqual(['F', 'G', 'A', 'B', 'C'])
  })

  it('wraps past B back to C', () => {
    expect(fiveFingerNotes('G')).toEqual(['G', 'A', 'B', 'C', 'D'])
    expect(fiveFingerNotes('A')).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(fiveFingerNotes('B')).toEqual(['B', 'C', 'D', 'E', 'F'])
  })

  it('covers every white key', () => {
    expect(fiveFingerNotes('D')).toEqual(['D', 'E', 'F', 'G', 'A'])
    expect(fiveFingerNotes('E')).toEqual(['E', 'F', 'G', 'A', 'B'])
  })

  it('always returns five distinct notes', () => {
    for (const start of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      const notes = fiveFingerNotes(start)
      expect(notes).toHaveLength(5)
      expect(new Set(notes).size).toBe(5)
      expect(notes[0]).toBe(start)
    }
  })

  it('returns nothing for a note that is not a white key', () => {
    expect(fiveFingerNotes('H')).toEqual([])
    expect(fiveFingerNotes('')).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- handPosition`
Expected: FAIL — "Failed to resolve import './handPosition'".

- [ ] **Step 3: Write `src/kickoffs/piano/handPosition.ts`**

```ts
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/**
 * The five white keys a hand covers starting from `start`.
 *
 * Right hand: thumb (1) on `start`, fingers 2-5 on the rest going up.
 * Left hand: the same five notes an octave lower, mirrored — pinky (5) on
 * `start`, thumb (1) at the top.
 */
export function fiveFingerNotes(start: string): string[] {
  const startIndex = WHITE_NOTES.indexOf(start as (typeof WHITE_NOTES)[number])
  if (startIndex === -1) return []
  return Array.from({ length: 5 }, (_, step) => WHITE_NOTES[(startIndex + step) % WHITE_NOTES.length])
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- handPosition`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test for the piano blocks and prompt**

`src/kickoffs/piano/pianoBlocks.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer } from '../../core/blocks'
import { getPromptComponent } from '../../core/playground/promptRegistry'
import '../index'

describe('KEYBOARD block', () => {
  it('renders a keyboard with the requested octaves, labels, and caption', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[
          {
            type: 'KEYBOARD',
            octaves: 1,
            labels: 'all',
            highlight: ['C'],
            caption: 'Look at the black keys.',
            ariaLabel: 'One octave.',
          },
        ]}
      />,
    )
    expect(screen.getByRole('img', { name: 'One octave.' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-white-key]')).toHaveLength(7)
    expect(container.querySelectorAll('[data-highlighted]')).toHaveLength(1)
    expect(screen.getByText('Look at the black keys.')).toBeInTheDocument()
  })

  it('falls back to two unlabelled octaves when the block omits settings', () => {
    const { container } = render(<BlockRenderer blocks={[{ type: 'KEYBOARD' }]} />)
    expect(container.querySelectorAll('[data-white-key]')).toHaveLength(14)
    expect(screen.queryByText('C')).not.toBeInTheDocument()
  })
})

describe('HAND_RULE block', () => {
  it('shows the five notes with right-hand and left-hand finger numbers', () => {
    render(<BlockRenderer blocks={[{ type: 'HAND_RULE', note: 'F' }]} />)
    for (const note of ['F', 'G', 'A', 'B', 'C']) {
      expect(screen.getByText(note)).toBeInTheDocument()
    }
    expect(screen.getByRole('row', { name: /right/i })).toHaveTextContent('12345')
    expect(screen.getByRole('row', { name: /left/i })).toHaveTextContent('54321')
  })

  it('defaults to F when the block omits a note', () => {
    render(<BlockRenderer blocks={[{ type: 'HAND_RULE' }]} />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders nothing for a note that is not a white key', () => {
    const { container } = render(<BlockRenderer blocks={[{ type: 'HAND_RULE', note: 'H' }]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('NOTE_LETTER prompt', () => {
  it('is registered and renders the letter', () => {
    const Prompt = getPromptComponent('NOTE_LETTER')
    if (!Prompt) throw new Error('NOTE_LETTER prompt was not registered')
    render(<Prompt prompt="F" />)
    expect(screen.getByText('F')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test and watch it fail**

Run: `npm test -- pianoBlocks`
Expected: FAIL — "Failed to resolve import '../index'".

- [ ] **Step 7: Write `src/kickoffs/piano/KeyboardBlock.tsx`**

```tsx
import type { Block } from '../../types/content'
import { PianoKeyboard } from './PianoKeyboard'

export function KeyboardBlock({ block }: { block: Block }) {
  const caption = typeof block.caption === 'string' ? block.caption : undefined
  const labels = block.labels === 'all' || block.labels === 'c-only' ? block.labels : 'none'

  return (
    <figure className="flex w-full flex-col gap-4">
      <PianoKeyboard
        octaves={typeof block.octaves === 'number' ? block.octaves : 2}
        labels={labels}
        highlight={Array.isArray(block.highlight) ? (block.highlight as string[]) : []}
        ariaLabel={typeof block.ariaLabel === 'string' ? block.ariaLabel : 'A piano keyboard.'}
      />
      {caption ? <figcaption className="max-w-[54ch] text-sm text-ink-muted">{caption}</figcaption> : null}
    </figure>
  )
}
```

- [ ] **Step 8: Write `src/kickoffs/piano/HandRuleBlock.tsx`**

A real `<table>` so the note-to-finger relationship is exposed to assistive technology rather than being a purely visual grid.

```tsx
import type { Block } from '../../types/content'
import { fiveFingerNotes } from './handPosition'

const RIGHT_HAND = [1, 2, 3, 4, 5]
const LEFT_HAND = [5, 4, 3, 2, 1]

export function HandRuleBlock({ block }: { block: Block }) {
  const anchor = typeof block.note === 'string' ? block.note : 'F'
  const notes = fiveFingerNotes(anchor)
  if (notes.length === 0) return null

  return (
    <div className="w-full max-w-lg rounded-xl border border-line bg-surface-raised/60 p-6 sm:p-8">
      <table className="w-full border-separate border-spacing-y-3">
        <caption className="sr-only">
          Finger numbers for both hands starting from {anchor}. 1 is the thumb, 5 is the little finger.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Note</th>
            {notes.map((note) => (
              <th key={note} scope="col" className="font-display text-2xl font-normal text-ink sm:text-3xl">
                {note}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Right</th>
            {RIGHT_HAND.map((finger) => (
              <td key={finger} className="text-center text-sm text-ink-muted">{finger}</td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Left</th>
            {LEFT_HAND.map((finger) => (
              <td key={finger} className="text-center text-sm text-ink-muted">{finger}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-4 text-sm text-ink-muted">
        1 is your thumb, 5 is your little finger. Your left hand plays the same five notes an octave lower.
      </p>
    </div>
  )
}
```

- [ ] **Step 9: Write `src/kickoffs/piano/NoteLetterPrompt.tsx`**

```tsx
export function NoteLetterPrompt({ prompt }: { prompt: string }) {
  return <span className="font-display text-[7rem] leading-none text-ink sm:text-[11rem]">{prompt}</span>
}
```

- [ ] **Step 10: Write the two registration files**

`src/kickoffs/piano/index.ts`:

```ts
import { registerBlocks } from '../../core/blocks'
import { registerPrompts } from '../../core/playground/promptRegistry'
import { HandRuleBlock } from './HandRuleBlock'
import { KeyboardBlock } from './KeyboardBlock'
import { NoteLetterPrompt } from './NoteLetterPrompt'

registerBlocks({
  KEYBOARD: KeyboardBlock,
  HAND_RULE: HandRuleBlock,
})

registerPrompts({
  NOTE_LETTER: NoteLetterPrompt,
})
```

`src/kickoffs/index.ts`:

```ts
// Importing this module wires every kickoff into core. Add new kickoffs here.
import '../core/blocks'
import './piano'
```

- [ ] **Step 11: Run the test and verify it passes**

Run: `npm test -- pianoBlocks`
Expected: PASS, 6 tests.

- [ ] **Step 12: Commit**

```bash
git add frontend/src/kickoffs
git commit -m "feat: add the Piano kickoff module and register it with core"
```

---

## Task 9: Shell, theme, routing, and the home shelf

**Files:**
- Create: `frontend/src/core/shell/Shell.tsx`, `frontend/src/core/theme/KickoffTheme.tsx`, `frontend/src/app/router.tsx`, `frontend/src/app/routes/HomeRoute.tsx`, `frontend/src/app/routes/RouteError.tsx`, `frontend/src/app/routes/KickoffRoute.tsx` (placeholder, filled in by Task 10)
- Modify: `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/App.test.tsx`
- Test: `frontend/src/app/routes/HomeRoute.test.tsx`

**Interfaces:**
- Consumes: `loadShelf`, `loadKickoff` from Task 2; `KickoffSummary`, `Kickoff` from Task 2.
- Produces: `routes` (a React Router route array, exported for tests), `router`, `<Shell />` (wraps `<Outlet />`), `<KickoffTheme accent={string}>`.

- [ ] **Step 1: Write the failing test**

`src/app/routes/HomeRoute.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from '../router'

const shelf = [
  {
    slug: 'piano',
    title: 'Piano',
    tagline: 'Find your way around the keys.',
    category: 'Music',
    accent: '#b4622a',
    status: 'LIVE',
  },
]

function stubFetch(handler: (path: string) => { ok: boolean; status: number; body: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) => {
      const result = handler(path)
      return { ok: result.ok, status: result.status, json: async () => result.body }
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('HomeRoute', () => {
  it('shows the wordmark and the question', async () => {
    stubFetch(() => ({ ok: true, status: 200, body: shelf }))
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'What do you want to start?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kick Off' })).toBeInTheDocument()
  })

  it('lists every kickoff on the shelf with its tagline', async () => {
    stubFetch(() => ({ ok: true, status: 200, body: shelf }))
    renderAt('/')
    expect(await screen.findByRole('link', { name: /Piano/ })).toBeInTheDocument()
    expect(screen.getByText('Find your way around the keys.')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
  })

  it('links a kickoff to its own page', async () => {
    stubFetch(() => ({ ok: true, status: 200, body: shelf }))
    const router = renderAt('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('link', { name: /Piano/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/piano'))
  })

  it('shows a readable error when content fails to load', async () => {
    stubFetch(() => ({ ok: false, status: 500, body: null }))
    renderAt('/')
    expect(await screen.findByRole('heading', { name: "That didn't load." })).toBeInTheDocument()
    expect(screen.getByText(/Could not load \/content\/index\.json \(500\)/)).toBeInTheDocument()
  })
})
```

Replace the existing `src/App.test.tsx` with a single smoke test, since `App` is now only a router host:

```tsx
import { describe, expect, it } from 'vitest'
import { routes } from './app/router'

describe('routes', () => {
  it('defines a home route and a kickoff route', () => {
    const paths = routes[0].children?.map((child) => child.path)
    expect(paths).toEqual(['/', '/:slug'])
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- HomeRoute`
Expected: FAIL — "Failed to resolve import '../router'".

- [ ] **Step 3: Write `src/core/shell/Shell.tsx`**

```tsx
import { Link, Outlet } from 'react-router-dom'

export function Shell() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-5xl items-center px-6 py-7 sm:px-10">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Kick Off
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-32 sm:px-10">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/core/theme/KickoffTheme.tsx`**

```tsx
import type { ReactNode } from 'react'

/**
 * A kickoff's only visual liberty at the page level: it sets the accent every
 * core component already reads. Core fixes the type scale and spacing rhythm.
 */
export function KickoffTheme({ accent, children }: { accent: string; children: ReactNode }) {
  return <div style={{ ['--color-accent' as string]: accent }}>{children}</div>
}
```

- [ ] **Step 5: Write `src/app/routes/RouteError.tsx`**

```tsx
import { Link, useRouteError } from 'react-router-dom'

export function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Something went wrong on our side.'

  return (
    <div className="pt-16 sm:pt-28">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">That didn't load.</h1>
      <p className="mt-4 max-w-[48ch] text-lg text-ink-muted">{message}</p>
      <Link to="/" className="mt-10 inline-block border-b border-ink pb-0.5 text-ink">
        Back to the start
      </Link>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/app/routes/HomeRoute.tsx`**

```tsx
import { Link, useLoaderData } from 'react-router-dom'
import type { KickoffSummary } from '../../types/content'

export function HomeRoute() {
  const shelf = useLoaderData() as KickoffSummary[]

  return (
    <div className="pt-10 sm:pt-24">
      <h1 className="max-w-[16ch] font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
        What do you want to start?
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg text-ink-muted sm:text-xl">
        Pick one thing. Learn the idea that unlocks it, mess around until it sticks, then go and do it for real.
      </p>

      <ul className="mt-16 border-t border-line sm:mt-24">
        {shelf.map((kickoff) => (
          <li key={kickoff.slug} className="border-b border-line">
            <Link
              to={`/${kickoff.slug}`}
              className="group flex flex-col gap-2 py-8 transition-colors sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="font-display text-4xl text-ink transition-colors group-hover:text-accent sm:text-5xl">
                {kickoff.title}
              </span>
              <span className="text-lg text-ink-muted">{kickoff.tagline}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint sm:ml-auto">
                {kickoff.category}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 7: Write `src/app/router.tsx`**

`KickoffRoute` does not exist yet — create a one-line placeholder in Task 10. For now import it and let Task 10 fill it in; to keep this task independently green, create `src/app/routes/KickoffRoute.tsx` containing exactly:

```tsx
export function KickoffRoute() {
  return null
}
```

```tsx
import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '../core/shell/Shell'
import { loadKickoff, loadShelf } from '../services/contentSource'
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
    ],
  },
]

export const router = createBrowserRouter(routes)
```

- [ ] **Step 8: Rewrite `src/App.tsx` and `src/main.tsx`**

`src/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'

export default function App() {
  return <RouterProvider router={router} />
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './kickoffs' // registers every kickoff's blocks and prompts before first render
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS — all suites, including the 4 new `HomeRoute` tests.

- [ ] **Step 10: Commit**

```bash
git add frontend/src
git commit -m "feat: add the shell, routing, and the home shelf"
```

---

## Task 10: The kickoff page

**Files:**
- Create: `frontend/src/core/ui/Section.tsx`
- Modify: `frontend/src/app/routes/KickoffRoute.tsx` (replace the placeholder)
- Test: `frontend/src/app/routes/KickoffRoute.test.tsx`

**Interfaces:**
- Consumes: `BlockRenderer` (Task 4), `Playground` (Task 6), `KickoffTheme` (Task 9), `Kickoff` (Task 2), the piano registrations (Task 8).
- Produces: `<Section title={string}>` and the assembled kickoff page.

- [ ] **Step 1: Write the failing test**

`src/app/routes/KickoffRoute.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../../kickoffs'
import { routes } from '../router'

const piano = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../../public/content/piano.json'), 'utf8'),
)

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderPiano() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => piano })),
  )
  const router = createMemoryRouter(routes, { initialEntries: ['/piano'] })
  render(<RouterProvider router={router} />)
}

describe('KickoffRoute', () => {
  it('leads with the kickoff title, tagline, and the exercise it holds', async () => {
    renderPiano()
    expect(await screen.findByRole('heading', { level: 1, name: 'Piano' })).toBeInTheDocument()
    expect(screen.getByText('Find your way around the keys.')).toBeInTheDocument()
    expect(screen.getByText(/01/)).toBeInTheDocument()
    expect(screen.getByText(/Find your hand position/)).toBeInTheDocument()
  })

  it('renders the three sections in order', async () => {
    renderPiano()
    await screen.findByRole('heading', { level: 1, name: 'Piano' })
    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(headings).toEqual(['The Idea', 'The Playground', "What's Next"])
  })

  it('renders the primer including keyboard diagrams and the hand rule', async () => {
    renderPiano()
    await screen.findByRole('heading', { level: 1, name: 'Piano' })
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText(/The black keys come in groups of two and three/)).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('runs the playground with the first note and the pause control', async () => {
    renderPiano()
    await screen.findByRole('heading', { level: 1, name: 'Piano' })
    expect(screen.getByText('Right thumb on the note. Left pinky on the same note, an octave down.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('C')
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unhurried' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Shuffled' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lists what comes next without pretending it exists yet', async () => {
    renderPiano()
    await screen.findByRole('heading', { level: 1, name: 'Piano' })
    expect(screen.getByText('Name the note')).toBeInTheDocument()
    expect(screen.getByText('Keep time')).toBeInTheDocument()
    expect(screen.getByText('Your first chord')).toBeInTheDocument()
    expect(screen.getAllByText('Soon')).toHaveLength(3)
  })

  it('applies the kickoff accent as a CSS variable', async () => {
    renderPiano()
    await screen.findByRole('heading', { level: 1, name: 'Piano' })
    const themed = document.querySelector('[style*="--color-accent"]') as HTMLElement
    expect(themed.style.getPropertyValue('--color-accent')).toBe('#b4622a')
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm test -- KickoffRoute`
Expected: FAIL — the placeholder `KickoffRoute` renders `null`, so `findByRole('heading', { name: 'Piano' })` times out.

- [ ] **Step 3: Write `src/core/ui/Section.tsx`**

```tsx
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mt-24 border-t border-line pt-10 sm:mt-32 sm:pt-12"
    >
      <h2 className="mb-10 text-xs uppercase tracking-[0.18em] text-ink-faint sm:mb-14">{title}</h2>
      {children}
    </motion.section>
  )
}
```

- [ ] **Step 4: Write `src/app/routes/KickoffRoute.tsx`**

```tsx
import { useLoaderData } from 'react-router-dom'
import { BlockRenderer } from '../../core/blocks'
import { Playground } from '../../core/playground/Playground'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import { Section } from '../../core/ui/Section'
import type { Kickoff } from '../../types/content'

export function KickoffRoute() {
  const kickoff = useLoaderData() as Kickoff

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{kickoff.category}</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-ink sm:text-8xl">{kickoff.title}</h1>
        <p className="mt-5 max-w-[40ch] text-xl text-ink-muted sm:text-2xl">{kickoff.tagline}</p>
        <p className="mt-10 text-sm text-ink-faint">
          <span className="text-accent">{kickoff.exerciseNumber}</span>
          <span className="mx-2">·</span>
          {kickoff.exerciseTitle}
        </p>
      </header>

      <Section title="The Idea">
        <div className="flex flex-col items-start gap-12">
          <BlockRenderer blocks={kickoff.idea} />
        </div>
      </Section>

      <Section title="The Playground">
        <Playground config={kickoff.playground} />
      </Section>

      <Section title="What's Next">
        <ul className="border-t border-line">
          {kickoff.whatsNext.map((item) => (
            <li key={item.number} className="flex gap-6 border-b border-line py-7">
              <span className="font-display text-2xl text-ink-faint">{item.number}</span>
              <div className="min-w-0">
                <p className="text-lg text-ink">{item.title}</p>
                <p className="mt-1 max-w-[54ch] text-ink-muted">{item.description}</p>
              </div>
              <span className="ml-auto self-start text-xs uppercase tracking-[0.16em] text-ink-faint">Soon</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-[46ch] text-ink-muted">
          And when you have this — go and play a real piano. Kick Off is for starting, not for staying.
        </p>
      </Section>
    </KickoffTheme>
  )
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- KickoffRoute`
Expected: PASS, 6 tests.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS, every suite.

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat: assemble the kickoff page from The Idea, The Playground, and What's Next"
```

---

## Task 11: Verification and polish

**Files:**
- Modify: any file needing a fix found below
- Test: the full suite

**Interfaces:**
- Consumes: everything.
- Produces: a verified build.

- [ ] **Step 1: Verify core never learned what piano is**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff/frontend"
grep -rniE '\b(piano|octave|finger)\b|\bnote\b' src/core src/app --include='*.ts' --include='*.tsx' | grep -v '\.test\.'
```

Expected: **no output.** The one legitimate near-match is `KeyboardEvent` / `onKeyDown` in `src/core/playground/Playground.tsx`, which the pattern above deliberately does not catch. Any real hit is a leak of piano knowledge into core — move it into `src/kickoffs/piano/`.

- [ ] **Step 2: Verify the banned product vocabulary is absent**

```bash
grep -rniE '\b(lesson|course|quiz|score|streak|badge|achievement)\b' src public/content | grep -v '\.test\.'
```

Expected: no output.

- [ ] **Step 3: Run the full suite and the production build**

```bash
npm test
npm run build
```

Expected: all tests pass; build completes with no TypeScript errors.

- [ ] **Step 4: Look at it**

```bash
npm run dev
```

Open `http://localhost:5173` and walk the journey, checking each:

- Home reads as a question, not a dashboard. One kickoff, no empty-state apology.
- Piano page: title, tagline, `01 · Find your hand position`.
- The Idea: three keyboard diagrams render with correct black-key grouping (2, 3, 2, 3), C highlights sit immediately left of each group of two, the hand-rule table is legible.
- The Playground: one letter, large, centred. It changes every 8 seconds. The timing line fills smoothly and restarts on each change.
- Pause stops both the letter and the timing line. Space pauses. Space with the pause button focused toggles **once**, not twice.
- Switching to Brisk restarts the timing line at the new duration.
- The accent colour appears on the `01`, the highlighted C keys, and the timing line.

- [ ] **Step 5: Check the three breakpoints**

Resize to 375px, 768px, and 1280px. At 375px: the keyboard diagrams stay inside the viewport with no horizontal page scroll, the playground letter still dominates, and the controls wrap to their own rows.

- [ ] **Step 6: Check motion and accessibility**

- Turn on Reduce Motion (macOS: System Settings → Accessibility → Display). The note still changes on the timer; transitions become instant.
- Tab through the Piano page. Every control is reachable, focus is visible, and the keyboard diagrams are skipped as single images rather than fourteen stops.
- Confirm the playground letter is inside the `role="status"` region.

- [ ] **Step 7: Fix anything the walkthrough surfaced, then re-run**

```bash
npm test && npm run build
```

- [ ] **Step 8: Commit**

```bash
cd "/Users/sharad/Desktop/Cool stuff/kickoff"
git add -A
git commit -m "chore: verify the Piano kickoff end to end"
```

---

## Self-Review

**Spec coverage**

| Spec section | Covered by |
|---|---|
| §2 Kickoff = Idea / Playground / What's Next | Task 10 |
| §3 Home shelf, categories modelled not surfaced | Tasks 2, 3, 9 |
| §4 Piano primer content, all seven beats | Task 3 (content), Tasks 7–8 (blocks), Task 10 (assembly) |
| §5 Letter only, timer, speeds, random default, pause-only, spacebar, timing line | Tasks 5, 6 |
| §6 Two registries, opaque types, graceful unknown types | Tasks 4, 6, 8 |
| §7 No backend, content source is the seam | Task 2 |
| §8 Type scale, warm palette, per-kickoff accent, motion in three places | Tasks 1, 9, 10 |
| §9 `role="img"` diagrams, real pause button, live region, reduced motion | Tasks 1, 6, 7, 11 |
| §11 Definition of done | Task 11 |

**Known gaps, accepted deliberately**

- No automated axe/a11y assertion; Task 11 step 6 is a manual checklist. Adding an axe dependency for one page is not worth it yet.
- No visual regression testing.
- Category and search have data but no UI, per spec §10.
