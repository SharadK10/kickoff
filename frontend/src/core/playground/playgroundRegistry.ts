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
