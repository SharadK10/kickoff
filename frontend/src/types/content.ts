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
