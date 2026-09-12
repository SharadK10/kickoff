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
  /** A closing line for the "What's Next" section. Kickoff-specific copy, owned by content. */
  closing: string
}
