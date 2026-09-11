import type { Block } from '../../types/content'

export function Prose({ block }: { block: Block }) {
  return (
    <p className="max-w-[58ch] text-lg leading-relaxed text-ink-muted sm:text-xl sm:leading-relaxed">
      {String(block.text ?? '')}
    </p>
  )
}
