import { axe } from 'vitest-axe'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GraphVisualizer } from './GraphVisualizer'
import { breadthFirstAdapter, depthFirstAdapter } from '../graphAdapters'
import type { DepthFirstSearchState, DepthFirstSearchTrace, GraphTraversalState, GraphTraversalTrace } from '../types'

const nodes = ['A', 'B', 'C', 'D']
const edges = [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'D' }]
const state: GraphTraversalState = {
  kind: 'GRAPH_TRAVERSAL',
  nodeStatuses: { A: 'PROCESSED', B: 'ACTIVE', C: 'DISCOVERED', D: 'UNREACHED' },
  queue: ['C'], traversalOrder: ['A', 'B'], parents: { B: 'A', C: 'B' },
  examinedEdge: { from: 'B', to: 'C' },
}
const result: GraphTraversalTrace['result'] = {
  kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B', 'C'], parents: { B: 'A', C: 'B' },
  unreachableNodes: ['D'], visitedNodeCount: 3, edgeExaminationCount: 4, maximumQueueSize: 1,
}

describe('GraphVisualizer', () => {
  it('shows authored weights accessibly throughout playback without changing edge styles', async () => {
    const mixedEdges = [{ from: 'A', to: 'B', weight: 1 }, { from: 'B', to: 'C', weight: 99 }, { from: 'C', to: 'D' }]
    const { container, rerender } = render(<GraphVisualizer nodes={nodes} edges={mixedEdges} presentation={breadthFirstAdapter.present(nodes)} />)
    expect(screen.getByRole('region', { name: 'Weighted graph, scroll to explore' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('img')).toHaveAccessibleName(/A–B: weight 1; B–C: weight 99; C–D: unweighted/)
    expect(screen.getByRole('group', { name: 'A–B, weight 1' })).toHaveTextContent('1')
    expect(screen.getByRole('group', { name: 'B–C, weight 99' })).toHaveTextContent('99')
    expect(container.querySelectorAll('.graph-weight')).toHaveLength(2)
    const badgePositions = [...container.querySelectorAll('.graph-weight rect')].map(rect => [rect.getAttribute('x'), rect.getAttribute('y')])
    rerender(<GraphVisualizer nodes={nodes} edges={mixedEdges} presentation={breadthFirstAdapter.present(nodes, state, result)} />)
    expect(container.querySelectorAll('.graph-edge--tree')).toHaveLength(1)
    expect(container.querySelectorAll('.graph-edge--examined')).toHaveLength(1)
    expect([...container.querySelectorAll('.graph-weight rect')].map(rect => [rect.getAttribute('x'), rect.getAttribute('y')])).toEqual(badgePositions)
    expect((await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toHaveLength(0)
  })

  it('renders adapter-supplied frontier language and annotations without BFS assumptions', () => {
    const presentation = breadthFirstAdapter.present(nodes, state)
    render(<GraphVisualizer nodes={nodes} edges={edges} presentation={{
      ...presentation,
      title: 'Custom graph',
      description: 'Stack: C. Current node: B.',
      rows: [{ label: 'Stack', value: 'C' }],
      nodes: { ...presentation.nodes, B: { label: 'current', symbol: '*', style: 'active' } },
    }} />)
    expect(screen.getByRole('img', { name: 'Custom graph. Stack: C. Current node: B.' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'B, current' })).toBeInTheDocument()
    expect(screen.getByText('Stack')).toBeInTheDocument()
    expect(screen.queryByText('Queue')).not.toBeInTheDocument()
  })

  it('renders deterministic labeled nodes with non-color status cues', () => {
    const { container, rerender } = render(<GraphVisualizer nodes={nodes} edges={edges} presentation={breadthFirstAdapter.present(nodes, state)} />)
    const graph = screen.getByRole('img', { name: /A: processed.*Queue: C.*Examined edge: B–C.*Parents: B from A, C from B/i })
    for (const [node, status] of [['A','processed'],['B','active'],['C','discovered'],['D','unreached']]) {
      expect(within(graph).getByRole('group', { name: `${node}, ${status}` })).toBeInTheDocument()
    }
    expect(container.querySelector('.graph-node--unreached')).toBeInTheDocument()
    for (const symbol of ['✓', '▶', '+', '○']) expect(within(graph).getByText(symbol)).toBeInTheDocument()
    const positions = nodes.map(node => within(graph).getByText(node).getAttribute('x'))
    rerender(<GraphVisualizer nodes={nodes} edges={edges} presentation={breadthFirstAdapter.present(nodes, state)} />)
    expect(nodes.map(node => within(graph).getByText(node).getAttribute('x'))).toEqual(positions)
  })

  it('distinguishes the transient examined edge from persistent tree edges by line style', () => {
    const { container } = render(<GraphVisualizer nodes={nodes} edges={edges} presentation={breadthFirstAdapter.present(nodes, state)} />)
    expect(container.querySelectorAll('.graph-edge--tree')).toHaveLength(1)
    expect(container.querySelectorAll('.graph-edge--examined')).toHaveLength(1)
    expect(container.querySelector('.graph-edge--examined')).toHaveClass('graph-edge')
  })

  it('provides complete textual state including unreachable completion', () => {
    render(<GraphVisualizer nodes={nodes} edges={edges} presentation={breadthFirstAdapter.present(nodes, state, result)} />)
    expect(screen.getByText('C', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('A → B')).toBeInTheDocument()
    expect(screen.getByText('A: processed; B: active; C: discovered; D: unreached')).toBeInTheDocument()
    expect(screen.getByText('B from A; C from B')).toBeInTheDocument()
    expect(screen.getByText('B–C')).toBeInTheDocument()
    expect(screen.getByText('D', { selector: 'dd' })).toBeInTheDocument()
  })

  it('renders DFS stack state and weighted edges accessibly', async () => {
    const dfsState: DepthFirstSearchState = {
      kind: 'GRAPH_TRAVERSAL',
      nodeStatuses: { A: 'PROCESSED', B: 'ACTIVE', C: 'DISCOVERED', D: 'UNREACHED' },
      stack: ['C'], traversalOrder: ['A', 'B'], parents: { B: 'A', C: 'B' },
      examinedEdge: { from: 'B', to: 'C' },
    }
    const dfsResult: DepthFirstSearchTrace['result'] = {
      kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B', 'C'], parents: { B: 'A', C: 'B' },
      unreachableNodes: ['D'], visitedNodeCount: 3, edgeExaminationCount: 4, maximumStackSize: 2,
    }
    const mixedEdges = [{ from: 'A', to: 'B', weight: 9 }, ...edges.slice(1)]
    const { container } = render(<GraphVisualizer nodes={nodes} edges={mixedEdges}
      presentation={depthFirstAdapter.present(nodes, dfsState, dfsResult)} />)

    expect(screen.getByRole('img')).toHaveAccessibleName(/Stack \(top first\): C.*Unreachable nodes: D/)
    expect(screen.getByText('Stack (top first)')).toBeInTheDocument()
    expect(screen.getByText('C', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'A–B, weight 9' })).toBeInTheDocument()
    expect((await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toHaveLength(0)
  })

  it('distinguishes the selected path from other search-tree edges without relying on color', async () => {
    const selectedState: GraphTraversalState = { ...state, selectedPath: ['A', 'B', 'C'] }
    const targetedResult: GraphTraversalTrace['result'] = {
      ...result, unreachableNodes: [], pathFound: true, path: ['A', 'B', 'C'], pathEdgeCount: 2, unexploredNodes: ['D'],
    }
    const { container } = render(<GraphVisualizer nodes={nodes} edges={edges}
      presentation={breadthFirstAdapter.present(nodes, selectedState, targetedResult)} />)

    expect(container.querySelectorAll('.graph-edge--selected-path')).toHaveLength(2)
    expect(screen.getByText('Fewest-edge path')).toBeInTheDocument()
    expect(screen.getByText('A → B → C')).toBeInTheDocument()
    expect((await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toHaveLength(0)
  })
})
