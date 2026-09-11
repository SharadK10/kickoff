import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BlockRenderer } from './BlockRenderer'
import { registerBlocks } from './registry'
import './index'

registerBlocks({
  TEST_BLOCK: ({ block }) => <span data-testid="test-block">{String(block.label)}</span>,
})

describe('BlockRenderer', () => {
  it('renders a registered block with its component', () => {
    render(<BlockRenderer blocks={[{ type: 'TEST_BLOCK', label: 'hello' }]} />)
    expect(screen.getByTestId('test-block')).toHaveTextContent('hello')
  })

  it('renders every block in order', () => {
    render(
      <BlockRenderer
        blocks={[
          { type: 'PROSE', text: 'first' },
          { type: 'KEY_IDEA', text: 'second' },
        ]}
      />,
    )
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('skips an unknown block type instead of crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <BlockRenderer
        blocks={[{ type: 'SKY_CHART', text: 'from a kickoff that is not loaded' }, { type: 'PROSE', text: 'still here' }]}
      />,
    )
    expect(screen.queryByText('from a kickoff that is not loaded')).not.toBeInTheDocument()
    expect(screen.getByText('still here')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('Kick Off: no renderer registered for block type "SKY_CHART"')
    warn.mockRestore()
  })
})

describe('core blocks', () => {
  it('renders PROSE text', () => {
    render(<BlockRenderer blocks={[{ type: 'PROSE', text: 'a paragraph' }]} />)
    expect(screen.getByText('a paragraph')).toBeInTheDocument()
  })

  it('renders KEY_IDEA text', () => {
    render(<BlockRenderer blocks={[{ type: 'KEY_IDEA', text: 'the one thing' }]} />)
    expect(screen.getByText('the one thing')).toBeInTheDocument()
  })
})
