import type { Block } from '../../types/content'
import { fiveFingerNotes } from './handPosition'

const RIGHT_HAND = [1, 2, 3, 4, 5]
const LEFT_HAND = [5, 4, 3, 2, 1]

export function HandRuleBlock({ block }: { block: Block }) {
  const anchor = typeof block.note === 'string' ? block.note : 'F'
  const notes = fiveFingerNotes(anchor)
  if (notes.length === 0) return null

  return (
    <div className="w-full max-w-lg rounded-xl border border-line bg-surface-raised/60 p-6 sm:p-8">
      <table className="w-full border-separate border-spacing-y-3">
        <caption className="sr-only">
          Finger numbers for both hands starting from {anchor}. 1 is the thumb, 5 is the little finger.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Note</th>
            {notes.map((note) => (
              <th key={note} scope="col" className="font-display text-2xl font-normal text-ink sm:text-3xl">
                {note}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Right</th>
            {RIGHT_HAND.map((finger) => (
              <td key={finger} className="text-center text-sm text-ink-muted">{finger}</td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">Left</th>
            {LEFT_HAND.map((finger) => (
              <td key={finger} className="text-center text-sm text-ink-muted">{finger}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-4 text-sm text-ink-muted">
        1 is your thumb, 5 is your little finger. Your left hand plays the same five notes an octave lower.
      </p>
    </div>
  )
}
