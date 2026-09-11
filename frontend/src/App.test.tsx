import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Kick Off wordmark', () => {
    render(<App />)
    expect(screen.getByText('Kick Off')).toBeInTheDocument()
  })
})
