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
