import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GraphVisualizer } from './GraphVisualizer'
import type { GraphTraversalState } from '../types'

const nodes = ['A', 'B', 'C', 'D']
const edges = [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'D' }]
const state: GraphTraversalState = {
  kind: 'GRAPH_TRAVERSAL',
  nodeStatuses: { A: 'PROCESSED', B: 'ACTIVE', C: 'DISCOVERED', D: 'UNREACHED' },
  queue: ['C'], traversalOrder: ['A', 'B'], parents: { B: 'A', C: 'B' },
  examinedEdge: { from: 'B', to: 'C' },
}

describe('GraphVisualizer', () => {
  it('renders deterministic labeled nodes with non-color status cues', () => {
    const { container, rerender } = render(<GraphVisualizer nodes={nodes} edges={edges} state={state} />)
    const graph = screen.getByRole('img', { name: /A: processed.*Queue: C.*Examined edge: B–C.*Parents: B from A, C from B/i })
    for (const [node, status] of [['A','processed'],['B','active'],['C','discovered'],['D','unreached']]) {
      expect(within(graph).getByRole('group', { name: `${node}, ${status}` })).toBeInTheDocument()
    }
    expect(container.querySelector('.graph-node--unreached')).toBeInTheDocument()
    for (const symbol of ['✓', '▶', '+', '○']) expect(within(graph).getByText(symbol)).toBeInTheDocument()
    const positions = nodes.map(node => within(graph).getByText(node).getAttribute('x'))
    rerender(<GraphVisualizer nodes={nodes} edges={edges} state={state} />)
    expect(nodes.map(node => within(graph).getByText(node).getAttribute('x'))).toEqual(positions)
  })

  it('distinguishes the transient examined edge from persistent tree edges by line style', () => {
    const { container } = render(<GraphVisualizer nodes={nodes} edges={edges} state={state} />)
    expect(container.querySelectorAll('.graph-edge--tree')).toHaveLength(1)
    expect(container.querySelectorAll('.graph-edge--examined')).toHaveLength(1)
    expect(container.querySelector('.graph-edge--examined')).toHaveClass('graph-edge')
  })

  it('provides complete textual state including unreachable completion', () => {
    render(<GraphVisualizer nodes={nodes} edges={edges} state={state} unreachableNodes={['D']} />)
    expect(screen.getByText('C', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('A → B')).toBeInTheDocument()
    expect(screen.getByText('A: processed; B: active; C: discovered; D: unreached')).toBeInTheDocument()
    expect(screen.getByText('B from A; C from B')).toBeInTheDocument()
    expect(screen.getByText('B–C')).toBeInTheDocument()
    expect(screen.getByText('D', { selector: 'dd' })).toBeInTheDocument()
  })
})
