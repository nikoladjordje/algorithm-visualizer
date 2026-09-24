import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SearchVisualizer } from './SearchVisualizer'

describe('SearchVisualizer', () => {
  it('presents indexed cells and their non-colour search state', () => {
    render(<SearchVisualizer values={[8, 3, 5]} target={5} selectedIndex={1} inspectedIndices={[0, 1]} />)

    expect(screen.getByRole('img', { name: 'Search values by index: 0: 8, 1: 3, 2: 5. Target: 5.' })).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('index 1')).toBeInTheDocument()
    expect(screen.getByText('inspected')).toBeInTheDocument()
    expect(screen.getByText('candidate, inspected')).toBeInTheDocument()
  })

  it('announces an empty search sequence without inventing a candidate', () => {
    render(<SearchVisualizer values={[]} target={4} inspectedIndices={[]} />)

    expect(screen.getByRole('img', { name: 'Search values by index: empty. Target: 4.' })).toBeInTheDocument()
    expect(screen.getByText('No values to inspect')).toBeInTheDocument()
  })
})
