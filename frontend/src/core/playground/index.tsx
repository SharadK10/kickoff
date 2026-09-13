import type { PlaygroundConfig } from '../../types/content'
import { Playground } from './Playground'
import { registerPlaygrounds } from './playgroundRegistry'

/** Adapts the existing declarative `<Playground config={PlaygroundConfig} />` to the opaque registry shape. */
function GenericPlayground({ config }: { config: Record<string, unknown> }) {
  return <Playground config={config as unknown as PlaygroundConfig} />
}

registerPlaygrounds({ GENERIC: GenericPlayground })

export { getPlaygroundComponent, registerPlaygrounds } from './playgroundRegistry'
export type { PlaygroundComponent } from './playgroundRegistry'
export { PlaygroundHost } from './PlaygroundHost'
export { Playground } from './Playground'
