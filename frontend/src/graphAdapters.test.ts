import { afterEach, describe, expect, it, vi } from 'vitest'
import { breadthFirstAdapter as adapter, depthFirstAdapter } from './graphAdapters'
import type { DepthFirstSearchEvent, DepthFirstSearchState, DepthFirstSearchTrace, GraphTraversalEvent, GraphTraversalState, GraphTraversalTrace } from './types'

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

afterEach(() => vi.unstubAllGlobals())

describe('BFS adapter', () => {
  it('preserves destination-free requests and passes the cancellation signal and trace through', async () => {
    const trace = { apiVersion: '2.0', result, events: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(trace))))
    const signal = new AbortController().signal
    const graph = { nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }], startNode: 'A' }
    await expect(adapter.createTrace(graph, signal)).resolves.toEqual(trace)
    expect(fetch).toHaveBeenCalledWith('/api/v2/algorithms/bfs/trace', expect.objectContaining({
      signal, body: JSON.stringify({ kind: 'GRAPH_TRAVERSAL', ...graph }),
    }))
  })

  it('preserves queue order, graph annotations, and complete accessible state without mutating snapshots', () => {
    const original = structuredClone(state)
    const presentation = adapter.present(['A', 'B', 'C', 'D'], state, ['D'])
    expect(presentation.description).toBe('A: processed, B: active, C: discovered, D: unreached. Queue: C. Traversal order: A, B. Examined edge: B–C. Parents: B from A, C from B. Unreachable nodes: D.')
    expect(presentation.treeEdges).toEqual([{ from: 'B', to: 'A' }, { from: 'C', to: 'B' }])
    expect(presentation.examinedEdge).toEqual({ from: 'B', to: 'C' })
    expect(presentation.rows.slice(0, 2)).toEqual([
      { label: 'Queue', value: 'C' }, { label: 'Traversal order', value: 'A → B' },
    ])
    expect(adapter.present(['A']).description).toBe('A: unreached. Queue: empty. Traversal order: empty. Examined edge: none. Parents: none.')
    expect(adapter.present(['A'], { ...state, queue: ['C', 'B'] }).rows[0].value).toBe('C → B')
    expect(state).toEqual(original)
  })

  it('keeps every BFS event explanation aligned with its pseudocode', () => {
    const base = { sequence: 1, state }
    const events: GraphTraversalEvent[] = [
      { ...base, type: 'TRAVERSAL_INITIALIZED', pseudocodeLineId: 'bfs-initialize', data: { kind: 'TRAVERSAL_INITIALIZED', startNode: 'A' } },
      { ...base, type: 'NODE_DEQUEUED', pseudocodeLineId: 'bfs-dequeue', data: { kind: 'NODE_DEQUEUED', node: 'A' } },
      { ...base, type: 'EDGE_EXAMINED', pseudocodeLineId: 'bfs-examine-edge', data: { kind: 'EDGE_EXAMINED', from: 'A', to: 'B' } },
      { ...base, type: 'NODE_DISCOVERED', pseudocodeLineId: 'bfs-enqueue-neighbor', data: { kind: 'NODE_DISCOVERED', node: 'B', parent: 'A' } },
      { ...base, type: 'ALREADY_DISCOVERED_SKIPPED', pseudocodeLineId: 'bfs-skip-neighbor', data: { kind: 'ALREADY_DISCOVERED_SKIPPED', from: 'B', to: 'A' } },
      { ...base, type: 'NODE_COMPLETED', pseudocodeLineId: 'bfs-complete-node', data: { kind: 'NODE_COMPLETED', node: 'A' } },
      { ...base, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'bfs-complete-traversal', data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A', 'B'], unreachableNodes: [] } },
    ]
    expect(events.map(event => adapter.explain(event))).toEqual([
      'Discover and enqueue A.', 'Dequeue and visit A.', 'Examine edge A–B.',
      'Discover B from A and enqueue it.', 'Skip A; it was already discovered.',
      'Finish A; all of its neighbors were examined.', 'Traversal complete: A, B.',
    ])
    expect(events.map(event => event.pseudocodeLineId)).toEqual(adapter.pseudocode.map(line => line.id))
  })

  it('preserves result metrics and completion language', () => {
    expect(adapter.metrics(result)).toEqual([
      { label: 'visited', value: 3 }, { label: 'edges examined', value: 4 }, { label: 'max queue', value: 1 },
    ])
    expect(adapter.complete(result)).toBe('Breadth-first traversal is complete. Unreachable nodes: D.')
    expect(adapter.complete({ ...result, unreachableNodes: [] })).toBe('Breadth-first traversal is complete. Unreachable nodes: none.')
  })
})

describe('DFS adapter', () => {
  const dfsState: DepthFirstSearchState = {
    kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'DISCOVERED' }, stack: ['A'],
    traversalOrder: [], parents: {}, examinedEdge: null,
  }
  const dfsResult: DepthFirstSearchTrace['result'] = {
    kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A'], parents: {}, unreachableNodes: [],
    visitedNodeCount: 1, edgeExaminationCount: 0, maximumStackSize: 1,
  }

  it('submits DFS through its v2 trace route', async () => {
    const trace = { apiVersion: '2.0', result: dfsResult, events: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(trace))))
    const signal = new AbortController().signal
    const graph = { nodes: ['A'], edges: [], startNode: 'A' }
    await expect(depthFirstAdapter.createTrace(graph, signal)).resolves.toEqual(trace)
    expect(fetch).toHaveBeenCalledWith('/api/v2/algorithms/dfs/trace', expect.objectContaining({
      signal, body: JSON.stringify({ kind: 'GRAPH_TRAVERSAL', ...graph }),
    }))
  })

  it('presents a stack and every single-node event in plain language', () => {
    const base = { sequence: 1, state: dfsState }
    const events: DepthFirstSearchEvent[] = [
      { ...base, type: 'TRAVERSAL_INITIALIZED', pseudocodeLineId: 'dfs-initialize', data: { kind: 'TRAVERSAL_INITIALIZED', startNode: 'A' } },
      { ...base, type: 'NODE_POPPED', pseudocodeLineId: 'dfs-pop', data: { kind: 'NODE_POPPED', node: 'A' } },
      { ...base, type: 'NODE_COMPLETED', pseudocodeLineId: 'dfs-complete-node', data: { kind: 'NODE_COMPLETED', node: 'A' } },
      { ...base, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'dfs-complete-traversal', data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A'], unreachableNodes: [] } },
    ]
    expect(events.map(event => depthFirstAdapter.explain(event))).toEqual([
      'Discover and push A onto the stack.', 'Pop and visit A.',
      'Finish A; it is now processed.', 'Traversal complete: A.',
    ])
    expect(events.map(event => event.pseudocodeLineId)).toEqual(depthFirstAdapter.pseudocode.map(line => line.id))
    expect(depthFirstAdapter.present(['A'], dfsState).rows[0]).toEqual({ label: 'Stack (top first)', value: 'A' })
    expect(depthFirstAdapter.present(['A'], dfsState).description).toContain('Stack (top first): A')
  })

  it('provides DFS metrics, complexity, and traversal-only result language', () => {
    expect(depthFirstAdapter.metrics(dfsResult)).toEqual([
      { label: 'visited', value: 1 }, { label: 'edges examined', value: 0 }, { label: 'max stack', value: 1 },
    ])
    expect(depthFirstAdapter.complete(dfsResult)).toBe('Depth-first traversal is complete. Unreachable nodes: none.')
    expect(depthFirstAdapter.complexity).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Time', value: 'O(V + E)' }),
      expect.objectContaining({ label: 'Space', value: 'O(V)' }),
    ]))
  })
})
