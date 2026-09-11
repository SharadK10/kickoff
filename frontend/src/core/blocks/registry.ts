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
