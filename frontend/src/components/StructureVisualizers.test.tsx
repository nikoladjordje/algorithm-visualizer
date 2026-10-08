import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueueVisualizer } from './QueueVisualizer'
import { StackVisualizer } from './StackVisualizer'
import { LinkedListVisualizer } from './LinkedListVisualizer'

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

  it('narrates head, stable node identities, next links, and null', () => {
    render(<LinkedListVisualizer state={{ kind: 'LINKED_LIST', headOccurrenceId: 2, activeOperationIndex: 1,
      allocatedOccurrenceId: 2, linkedOccurrenceId: 2,
      nodes: [{ occurrenceId: 1, value: 'A', nextOccurrenceId: null }, { occurrenceId: 2, value: 'A', nextOccurrenceId: 1 }] }} />)

    expect(screen.getByLabelText('Linked list: A, node 2, next node 1; A, node 1, next null.')).toBeInTheDocument()
    expect(screen.getAllByText('A')).toHaveLength(2)
    expect(screen.getByText('node 2')).toBeInTheDocument()
  })

  it('keeps an allocated but unlinked node visible before head moves', () => {
    render(<LinkedListVisualizer state={{ kind: 'LINKED_LIST', headOccurrenceId: null, activeOperationIndex: 0,
      allocatedOccurrenceId: 1, linkedOccurrenceId: null,
      nodes: [{ occurrenceId: 1, value: 'A', nextOccurrenceId: null }] }} />)

    expect(screen.getByLabelText('Linked list: empty, head null; allocated but not yet linked: A, node 1, next null.')).toBeInTheDocument()
    expect(screen.getByText(/Allocated node 1:/)).toBeInTheDocument()
  })
})
