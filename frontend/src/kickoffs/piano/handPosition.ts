const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/**
 * The five white keys a hand covers starting from `start`.
 *
 * Right hand: thumb (1) on `start`, fingers 2-5 on the rest going up.
 * Left hand: the same five notes an octave lower, mirrored — pinky (5) on
 * `start`, thumb (1) at the top.
 */
export function fiveFingerNotes(start: string): string[] {
  const startIndex = WHITE_NOTES.indexOf(start as (typeof WHITE_NOTES)[number])
  if (startIndex === -1) return []
  return Array.from({ length: 5 }, (_, step) => WHITE_NOTES[(startIndex + step) % WHITE_NOTES.length])
}
