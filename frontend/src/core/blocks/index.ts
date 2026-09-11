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
