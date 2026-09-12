const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** White-key positions within an octave that have a black key above and to the right. */
const BLACK_KEY_OFFSETS = [0, 1, 3, 4, 5] as const

export type PianoKeyboardProps = {
  octaves?: number
  labels?: 'none' | 'c-only' | 'all'
  highlight?: string[]
  ariaLabel: string
}

export function PianoKeyboard({ octaves = 2, labels = 'none', highlight = [], ariaLabel }: PianoKeyboardProps) {
  const totalWhite = octaves * 7
  const whiteKeys = Array.from({ length: totalWhite }, (_, position) => WHITE_NOTES[position % 7])

  const blackKeys: number[] = []
  for (let octave = 0; octave < octaves; octave += 1) {
    for (const offset of BLACK_KEY_OFFSETS) {
      blackKeys.push(octave * 7 + offset)
    }
  }

  const highlighted = new Set(highlight)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative flex h-32 w-full select-none overflow-hidden rounded-md border border-ink/20 bg-white sm:h-44"
      style={{ ['--total-white' as string]: String(totalWhite) }}
    >
      {whiteKeys.map((note, position) => {
        const isHighlighted = highlighted.has(note)
        const showLabel = labels === 'all' || (labels === 'c-only' && note === 'C')
        return (
          <div
            key={position}
            data-white-key=""
            data-note={note}
            data-highlighted={isHighlighted ? '' : undefined}
            className={[
              'flex flex-1 items-end justify-center border-r border-ink/10 pb-2 last:border-r-0',
              isHighlighted ? 'bg-accent/10' : '',
            ].join(' ')}
          >
            {showLabel ? (
              <span
                className={[
                  'text-[0.7rem] sm:text-sm',
                  isHighlighted ? 'font-medium text-accent' : 'text-ink-faint',
                ].join(' ')}
              >
                {note}
              </span>
            ) : null}
          </div>
        )
      })}

      {blackKeys.map((whitePosition) => (
        <div
          key={whitePosition}
          data-black-key=""
          aria-hidden="true"
          className="absolute top-0 h-[62%] -translate-x-1/2 rounded-b-[3px] bg-ink"
          style={{
            left: `calc(100% / var(--total-white) * ${whitePosition + 1})`,
            width: 'calc(100% / var(--total-white) * 0.58)',
          }}
        />
      ))}
    </div>
  )
}
