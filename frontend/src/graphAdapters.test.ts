import { afterEach, describe, expect, it, vi } from 'vitest'
import { breadthFirstAdapter as adapter, depthFirstAdapter, dijkstraAdapter } from './graphAdapters'
import type { DepthFirstSearchEvent, DepthFirstSearchState, DepthFirstSearchTrace, GraphTraversalEvent, GraphTraversalState, GraphTraversalTrace, PathfindingEvent, PathfindingState, PathfindingTrace } from './types'

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
    const presentation = adapter.present(['A', 'B', 'C', 'D'], state, result)
    expect(presentation.description).toBe('A: processed, B: active, C: discovered, D: unreached. Queue: C. Traversal order: A, B. Examined edge: B–C. Search tree: B from A, C from B. Unreachable nodes: D.')
    expect(presentation.treeEdges).toEqual([{ from: 'B', to: 'A' }, { from: 'C', to: 'B' }])
    expect(presentation.examinedEdge).toEqual({ from: 'B', to: 'C' })
    expect(presentation.rows.slice(0, 2)).toEqual([
      { label: 'Queue', value: 'C' }, { label: 'Traversal order', value: 'A → B' },
    ])
    expect(adapter.present(['A']).description).toBe('A: unreached. Queue: empty. Traversal order: empty. Examined edge: none. Search tree: none.')
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
      { ...base, type: 'PATH_RECONSTRUCTED', pseudocodeLineId: 'bfs-reconstruct-path', data: { kind: 'PATH_RECONSTRUCTED', destination: 'B', pathFound: true, path: ['A', 'B'], pathEdgeCount: 1 } },
    ]
    expect(events.map(event => adapter.explain(event))).toEqual([
      'Discover and enqueue A.', 'Dequeue and visit A.', 'Examine edge A–B.',
      'Discover B from A and enqueue it.', 'Skip A; it was already discovered.',
      'Finish A; all of its neighbors were examined.', 'Traversal complete: A, B.',
      'Fewest-edge path reconstructed: A → B.',
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

  it('presents a reconstructed path separately from the search tree and unexplored nodes', () => {
    const targetedState: GraphTraversalState = { ...state, selectedPath: ['A', 'B', 'C'] }
    const targetedResult: GraphTraversalTrace['result'] = {
      ...result,
      unreachableNodes: [],
      pathFound: true,
      path: ['A', 'B', 'C'],
      pathEdgeCount: 2,
      unexploredNodes: ['D'],
    }
    const presentation = adapter.present(['A', 'B', 'C', 'D'], targetedState, targetedResult)

    expect(presentation.selectedPathEdges).toEqual([{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }])
    expect(presentation.rows).toEqual(expect.arrayContaining([
      { label: 'Fewest-edge path', value: 'A → B → C' },
      { label: 'Unexplored nodes', value: 'D' },
    ]))
    expect(presentation.description).toContain('Fewest-edge path: A → B → C.')
    expect(adapter.complete(targetedResult)).toBe('Fewest-edge path found: A → B → C (2 edges).')
    expect(adapter.complete({ ...targetedResult, pathFound: false, path: [], pathEdgeCount: undefined }))
      .toBe('No path reaches the selected destination.')
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

  it('presents a stack and every DFS event in plain language', () => {
    const base = { sequence: 1, state: dfsState }
    const events: DepthFirstSearchEvent[] = [
      { ...base, type: 'TRAVERSAL_INITIALIZED', pseudocodeLineId: 'dfs-initialize', data: { kind: 'TRAVERSAL_INITIALIZED', startNode: 'A' } },
      { ...base, type: 'NODE_POPPED', pseudocodeLineId: 'dfs-pop', data: { kind: 'NODE_POPPED', node: 'A' } },
      { ...base, type: 'EDGE_EXAMINED', pseudocodeLineId: 'dfs-examine-edge', data: { kind: 'EDGE_EXAMINED', from: 'A', to: 'B' } },
      { ...base, type: 'NODE_DISCOVERED', pseudocodeLineId: 'dfs-push-neighbor', data: { kind: 'NODE_DISCOVERED', node: 'B', parent: 'A' } },
      { ...base, type: 'ALREADY_DISCOVERED_SKIPPED', pseudocodeLineId: 'dfs-skip-neighbor', data: { kind: 'ALREADY_DISCOVERED_SKIPPED', from: 'B', to: 'A' } },
      { ...base, type: 'NODE_COMPLETED', pseudocodeLineId: 'dfs-complete-node', data: { kind: 'NODE_COMPLETED', node: 'A' } },
      { ...base, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'dfs-complete-traversal', data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A'], unreachableNodes: [] } },
    ]
    expect(events.map(event => depthFirstAdapter.explain(event))).toEqual([
      'Discover and push A onto the stack.', 'Pop and visit A.', 'Examine edge A–B.',
      'Discover B from A and push it onto the stack.', 'Skip A; it was already discovered.',
      'Finish A; all of its neighbors were examined.', 'Traversal complete: A.',
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

  it('shows the top-first stack, search tree, examined edge, and ignored-weight warning', () => {
    const connectedState: DepthFirstSearchState = {
      kind: 'GRAPH_TRAVERSAL',
      nodeStatuses: { A: 'ACTIVE', C: 'DISCOVERED', B: 'DISCOVERED', Z: 'UNREACHED' },
      stack: ['C', 'B'], traversalOrder: ['A'], parents: { B: 'A', C: 'A' },
      examinedEdge: { from: 'A', to: 'C' },
    }
    const original = structuredClone(connectedState)
    const presentation = depthFirstAdapter.present(['A', 'C', 'B', 'Z'], connectedState, { ...dfsResult, unreachableNodes: ['Z'] })

    expect(presentation.rows.slice(0, 2)).toEqual([
      { label: 'Stack (top first)', value: 'C → B' },
      { label: 'Traversal order', value: 'A' },
    ])
    expect(presentation.treeEdges).toEqual([{ from: 'B', to: 'A' }, { from: 'C', to: 'A' }])
    expect(presentation.examinedEdge).toEqual({ from: 'A', to: 'C' })
    expect(presentation.description).toContain('Unreachable nodes: Z.')
    expect(depthFirstAdapter.inputWarning([{ from: 'A', to: 'C', weight: 7 }]))
      .toBe('Depth-first search ignores edge weights; they do not affect traversal order.')
    expect(depthFirstAdapter.presets.map(preset => preset.label))
      .toEqual(['DFS depth', 'Cycle', 'Disconnected', 'Edges vs cost', 'Mixed weights', 'Equal-cost tie', 'Unreachable destination'])
    expect(connectedState).toEqual(original)
  })
})

describe('Dijkstra adapter', () => {
  const pathState: PathfindingState = {
    kind: 'PATHFINDING',
    nodeStatuses: { A: 'SETTLED', C: 'ACTIVE', B: 'FRONTIER', D: 'UNREACHED' },
    tentativeDistances: { A: 0, C: 1, B: 4, D: null },
    parents: { C: 'A', B: 'A' },
    frontier: [{ node: 'B', distance: 4 }],
    examinedEdge: { from: 'C', to: 'B', weight: 2 },
  }
  const pathResult: PathfindingTrace['result'] = {
    kind: 'PATHFINDING', pathFound: true, path: ['A', 'C', 'D'], totalCost: 3,
    settledOrder: ['A', 'C', 'D'], parents: { C: 'A', B: 'A', D: 'C' },
    settledNodeCount: 3, relaxationAttemptCount: 5, successfulUpdateCount: 4,
    rejectedUpdateCount: 1, maximumFrontierSize: 2,
  }

  it('submits required destinations through the pathfinding route', async () => {
    const trace = { apiVersion: '2.0', result: pathResult, events: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(trace))))
    const signal = new AbortController().signal
    const graph = { nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B', weight: 2 }], startNode: 'A', destination: 'B' }

    await expect(dijkstraAdapter.createTrace(graph, signal)).resolves.toEqual(trace)
    expect(fetch).toHaveBeenCalledWith('/api/v2/algorithms/dijkstra/trace', expect.objectContaining({
      signal, body: JSON.stringify({ kind: 'PATHFINDING', ...graph }),
    }))
  })

  it('explains every semantic event and aligns it with pseudocode', () => {
    const base = { sequence: 1, state: pathState }
    const events: PathfindingEvent[] = [
      { ...base, type: 'PATHFINDING_INITIALIZED', pseudocodeLineId: 'dijkstra-initialize', data: { kind: 'PATHFINDING_INITIALIZED', startNode: 'A', destination: 'D' } },
      { ...base, type: 'STALE_FRONTIER_ENTRY_SKIPPED', pseudocodeLineId: 'dijkstra-skip-stale', data: { kind: 'STALE_FRONTIER_ENTRY_SKIPPED', node: 'B', queuedDistance: 9, currentDistance: 4 } },
      { ...base, type: 'NODE_SELECTED', pseudocodeLineId: 'dijkstra-select-node', data: { kind: 'NODE_SELECTED', node: 'C', distance: 1 } },
      { ...base, type: 'NODE_SETTLED', pseudocodeLineId: 'dijkstra-settle-node', data: { kind: 'NODE_SETTLED', node: 'C', distance: 1 } },
      { ...base, type: 'EDGE_EXAMINED', pseudocodeLineId: 'dijkstra-examine-edge', data: { kind: 'EDGE_EXAMINED', from: 'C', to: 'B', weight: 2, candidateCost: 3, currentKnownCost: 4 } },
      { ...base, type: 'DISTANCE_UPDATED', pseudocodeLineId: 'dijkstra-update-distance', data: { kind: 'DISTANCE_UPDATED', node: 'B', parent: 'C', previousDistance: 4, newDistance: 3 } },
      { ...base, type: 'RELAXATION_REJECTED', pseudocodeLineId: 'dijkstra-reject-relaxation', data: { kind: 'RELAXATION_REJECTED', from: 'C', to: 'B', weight: 3, candidateCost: 4, currentKnownCost: 4 } },
      { ...base, type: 'PATH_RECONSTRUCTED', pseudocodeLineId: 'dijkstra-reconstruct-path', data: { kind: 'PATH_RECONSTRUCTED', destination: 'D', pathFound: true, path: ['A', 'C', 'D'], totalCost: 3 } },
    ]

    expect(events.map(event => event.pseudocodeLineId)).toEqual(dijkstraAdapter.pseudocode.map(line => line.id))
    expect(events.map(event => dijkstraAdapter.explain(event))).toEqual([
      "Set A's distance to 0 and search for D.",
      'Discard stale B at cost 9; its current distance is 4.',
      'Remove C, the smallest frontier distance at 1.',
      'Settle C; its minimum cost is 1.',
      'Examine C–B (cost 2): candidate 3, known 4.',
      'Update B from 4 to 3 through C.',
      'Reject cost 4 for B; known cost 4 is no worse.',
      'Minimum-cost path reconstructed: A → C → D at total cost 3.',
    ])
  })

  it('presents ordered frontier, distances, metrics, and the final path without mutation', () => {
    const finalState: PathfindingState = { ...pathState, selectedPath: ['A', 'C', 'D'] }
    const original = structuredClone(finalState)
    const presentation = dijkstraAdapter.present(['A', 'C', 'B', 'D'], finalState, pathResult)

    expect(presentation.rows.slice(0, 2)).toEqual([
      { label: 'Priority frontier', value: 'B (4)' },
      { label: 'Tentative distances', value: 'A: 0; C: 1; B: 4; D: ∞' },
    ])
    expect(presentation.selectedPathEdges).toEqual([{ from: 'A', to: 'C' }, { from: 'C', to: 'D' }])
    expect(presentation.treeEdges).toEqual([{ from: 'C', to: 'A' }, { from: 'B', to: 'A' }])
    expect(dijkstraAdapter.metrics(pathResult)).toEqual([
      { label: 'settled', value: 3 }, { label: 'relaxations', value: 5 },
      { label: 'updates', value: 4 }, { label: 'rejected', value: 1 },
      { label: 'max frontier', value: 2 },
    ])
    expect(dijkstraAdapter.complete(pathResult)).toBe('Minimum-cost path found: A → C → D (total cost 3).')
    expect(dijkstraAdapter.complete({ ...pathResult, pathFound: false, path: [], totalCost: undefined }))
      .toBe('No path reaches the selected destination.')
    expect(dijkstraAdapter.inputWarning([{ from: 'A', to: 'C' }]))
      .toBe('Dijkstra treats every unweighted edge as cost 1.')
    expect(finalState).toEqual(original)
  })
})
