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
