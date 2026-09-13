import { getPlaygroundComponent } from './playgroundRegistry'

/**
 * Looks up a playground by its opaque type string and renders it. Core never
 * inspects `config` — whichever component `type` selects owns its shape.
 */
export function PlaygroundHost({ type, config }: { type: string; config: Record<string, unknown> }) {
  const Component = getPlaygroundComponent(type)
  if (!Component) {
    console.warn(`Kick Off: no renderer registered for playground type "${type}"`)
    return null
  }
  return <Component config={config} />
}
