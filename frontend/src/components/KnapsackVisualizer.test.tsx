import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnapsackVisualizer } from './KnapsackVisualizer'

describe('KnapsackVisualizer', () => {
  it('shows reconstruction movement, selected items, and the completed result', () => {
    render(<KnapsackVisualizer
      completed
      result={{ kind: 'DYNAMIC_PROGRAMMING', maximumValue: 9, totalSelectedWeight: 3, selectedItems: [{ name: 'Map', weight: 1, value: 4 }, { name: 'Compass', weight: 2, value: 5 }] }}
      state={{ kind: 'DYNAMIC_PROGRAMMING', items: [{ name: 'Map', weight: 1, value: 4 }, { name: 'Compass', weight: 2, value: 5 }], capacity: 3, table: [[0, 0, 0, 0], [0, 4, 4, 4], [0, 4, 5, 9]], activeItemCount: 2, activeCapacity: 3, dependencyCells: [{ itemCount: 1, capacity: 1 }], selectedItems: [{ name: 'Map', weight: 1, value: 4 }, { name: 'Compass', weight: 2, value: 5 }], selectedItemIndices: [0, 1], phase: 'RECONSTRUCTION' }}
    />)

    expect(screen.getByRole('cell', { name: /9.*active subproblem/ })).toHaveTextContent('9')
    expect(screen.getByText('Selected so far: Map, Compass')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Knapsack result' })).toHaveTextContent('Maximum value: 9')
    expect(screen.getByRole('region', { name: 'Knapsack result' })).toHaveTextContent('Total selected weight: 3')
    expect(screen.getByRole('region', { name: 'Knapsack result' })).toHaveTextContent('Selected items: Map, Compass')
  })

  it('presents an explicit empty selection after reconstruction', () => {
    render(<KnapsackVisualizer completed result={{ kind: 'DYNAMIC_PROGRAMMING', maximumValue: 0, totalSelectedWeight: 0, selectedItems: [] }} state={{ kind: 'DYNAMIC_PROGRAMMING', items: [{ name: 'Tent', weight: 2, value: 7 }], capacity: 0, table: [[0], [0]], activeItemCount: 0, activeCapacity: 0, dependencyCells: [], selectedItems: [], selectedItemIndices: [], phase: 'RECONSTRUCTION' }} />)

    expect(screen.getByText('Selected so far: none')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Knapsack result' })).toHaveTextContent('Selected items: None')
  })

  it('highlights only the reconstructed row when item names repeat', () => {
    render(<KnapsackVisualizer state={{ kind: 'DYNAMIC_PROGRAMMING', items: [{ name: 'Map', weight: 1, value: 4 }, { name: 'Map', weight: 2, value: 5 }], capacity: 2, table: [[0, 0, 0], [0, 4, 4], [0, 4, 5]], activeItemCount: 2, activeCapacity: 2, dependencyCells: [], selectedItems: [{ name: 'Map', weight: 2, value: 5 }], selectedItemIndices: [1], phase: 'RECONSTRUCTION' }} />)

    const rows = screen.getAllByRole('rowheader', { name: 'Map' }).map(header => header.closest('tr'))
    expect(rows[0]).not.toHaveAttribute('data-selected')
    expect(rows[1]).toHaveAttribute('data-selected', 'true')
  })
})
