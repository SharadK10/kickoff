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
