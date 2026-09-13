import type { PlaygroundItem } from '../../types/content'

export function NoteLetterPrompt({ item }: { item: PlaygroundItem }) {
  return (
    <span className="font-display text-[7rem] leading-none text-ink sm:text-[11rem]">
      {String(item.note ?? '')}
    </span>
  )
}
