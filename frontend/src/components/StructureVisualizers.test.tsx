import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueueVisualizer } from './QueueVisualizer'
import { StackVisualizer } from './StackVisualizer'

describe('structure visualizers', () => {
  it('labels equal value occurrences only while they coexist', () => {
    const state = { kind: 'DATA_STRUCTURES' as const, values: ['X', 'A', 'B', 'A', 'Y'], occurrenceIds: [2, 3, 4, 8, 9], activeOperationIndex: 2 }

    const { rerender } = render(<QueueVisualizer state={state} />)

    expect(screen.getAllByText(/Occurrence/).map(badge => badge.textContent)).toEqual(['Occurrence 1', 'Occurrence 2'])
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByLabelText('Queue, Front X, rear Y. Values from front: X, A occurrence 1, B, A occurrence 2, Y.')).toBeInTheDocument()

    rerender(<StackVisualizer state={{ ...state, values: ['A'], occurrenceIds: [8] }} />)

    expect(screen.queryByText(/Occurrence/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Stack, Top A. Values from top: A.')).toBeInTheDocument()
  })
})
