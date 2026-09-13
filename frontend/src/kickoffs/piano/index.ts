import { registerBlocks } from '../../core/blocks'
import { registerPlaygrounds } from '../../core/playground'
import { registerPrompts } from '../../core/playground/promptRegistry'
import { HandRuleBlock } from './HandRuleBlock'
import { KeyboardBlock } from './KeyboardBlock'
import { NoteLetterPrompt } from './NoteLetterPrompt'
import { ScaleDrillPlayground } from './ScaleDrillPlayground'

registerBlocks({
  KEYBOARD: KeyboardBlock,
  HAND_RULE: HandRuleBlock,
})

registerPrompts({
  NOTE_LETTER: NoteLetterPrompt,
})

registerPlaygrounds({
  SCALE_DRILL: ScaleDrillPlayground,
})
