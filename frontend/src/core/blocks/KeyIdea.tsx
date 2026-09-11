import type { Block } from '../../types/content'

export function KeyIdea({ block }: { block: Block }) {
  return (
    <p className="max-w-[46ch] border-l-2 border-accent py-1 pl-6 font-display text-2xl leading-snug text-ink sm:text-[2rem]">
      {String(block.text ?? '')}
    </p>
  )
}
