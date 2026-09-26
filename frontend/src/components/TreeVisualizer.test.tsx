import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreeVisualizer } from './TreeVisualizer'

describe('TreeVisualizer', () => {
  it('exposes relationships and non-color playback state to assistive technology', () => {
    render(<TreeVisualizer
      operation="PREORDER"
      completed
      state={{
        kind: 'TREE',
        nodes: [
          { id: 1, value: 8, parentId: null, leftId: 2, rightId: null },
          { id: 2, value: 3, parentId: 1, leftId: null, rightId: null },
        ],
        rootId: 1,
        activeNodeId: 1,
        traversalOrder: [8],
        comparisonDirection: 'left',
        attachedNodeId: 2,
      }}
    />)

    const tree = screen.getByRole('img', { name: 'Binary search tree' })
    expect(tree).toHaveAttribute('aria-describedby', 'tree-description tree-state-description')
    expect(screen.getByText('Root 8. 8: left 3, right none. 3: left none, right none.')).toHaveAttribute('id', 'tree-description')
    expect(screen.getByText('8: active, visited, comparison moves left. 3: attached. Tree operation complete.')).toHaveAttribute('id', 'tree-state-description')
    expect(screen.getByText('Comparison moves left.')).toBeInTheDocument()
    expect(screen.getByText('Tree operation complete.')).toBeInTheDocument()
  })
})
