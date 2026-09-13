import { fiveFingerNotes } from './handPosition'

export type ScaleStep = {
  scale: string
  note: string
  rightFinger: number
  leftFinger: number
}

const RIGHT_FINGER_SEQUENCE = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1]
const LEFT_FINGER_SEQUENCE = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5]

/**
 * The 10-step up-and-down drill for one scale: the five-finger-position
 * notes ascending, the top note held once for the turn, then the same five
 * descending back to the start.
 */
export function scaleSteps(scale: string): ScaleStep[] {
  const notes = fiveFingerNotes(scale)
  if (notes.length === 0) return []
  const noteSequence = [...notes, ...[...notes].reverse()]
  return noteSequence.map((note, index) => ({
    scale,
    note,
    rightFinger: RIGHT_FINGER_SEQUENCE[index],
    leftFinger: LEFT_FINGER_SEQUENCE[index],
  }))
}

/** All of the given scales' 10-step drills, concatenated in order — for "in order" mode. */
export function allScaleSteps(scales: string[]): ScaleStep[] {
  return scales.flatMap(scaleSteps)
}
