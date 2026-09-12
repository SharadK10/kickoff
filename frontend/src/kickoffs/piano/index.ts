import { registerBlocks } from '../../core/blocks'
import { registerPrompts } from '../../core/playground/promptRegistry'
import { HandRuleBlock } from './HandRuleBlock'
import { KeyboardBlock } from './KeyboardBlock'
import { NoteLetterPrompt } from './NoteLetterPrompt'

registerBlocks({
  KEYBOARD: KeyboardBlock,
  HAND_RULE: HandRuleBlock,
})

registerPrompts({
  NOTE_LETTER: NoteLetterPrompt,
})
