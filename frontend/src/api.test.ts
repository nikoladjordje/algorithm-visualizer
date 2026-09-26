import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDepthFirstSearchTrace, createDijkstraTrace, createGraphTraversalTrace, createInsertionSortTrace, createSearchTrace, createTreeTrace } from './api'
import type { AlgorithmTrace, ProblemDetail } from './types'

const trace: AlgorithmTrace = {
  apiVersion: '2.0',
  algorithm: { id: 'insertion', name: 'Insertion Sort', family: 'SORTING' },
  input: { kind: 'SORTING', values: [1] },
  result: { kind: 'SORTING', values: [1] },
  limits: { maximumEvents: 10000 },
  events: [],
}

afterEach(() => vi.unstubAllGlobals())

describe('createInsertionSortTrace', () => {
  it('returns a successful trace', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(trace, 200))
    vi.stubGlobal('fetch', fetchMock)
    await expect(createInsertionSortTrace([1])).resolves.toEqual(trace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/insertion/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'SORTING', values: [1] }),
    }))
  })

  it('rejects unsupported API versions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...trace, apiVersion: '3.0' }, 200)))
    await expect(createInsertionSortTrace([1])).rejects.toMatchObject({ kind: 'unavailable' })
  })

  it('preserves Problem Detail validation messages', async () => {
    const problem: ProblemDetail = {
      type: 'urn:problem:invalid-input',
      title: 'Invalid input',
      status: 400,
      detail: 'A maximum of 50 integers is allowed',
      instance: '/api/algorithms/insertion-sort',
      code: 'INVALID_INPUT',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(problem, 400)))

    await expect(createInsertionSortTrace([1])).rejects.toMatchObject({
      kind: 'validation',
      message: problem.detail,
      problem,
    })
  })

  it.each(['network', 'server'])('classifies %s failures as unavailable', async (failure) => {
    const fetchResult = failure === 'network'
      ? Promise.reject(new TypeError('Network error'))
      : Promise.resolve(response({ code: 'INTERNAL_ERROR' }, 500))
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchResult))
    await expect(createInsertionSortTrace([1])).rejects.toMatchObject({ kind: 'unavailable' })
  })
})

describe('createGraphTraversalTrace', () => {
  it('submits the typed connected graph request', async () => {
    const graphTrace = {
      apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
      input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' },
      result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A'], parents: {}, unreachableNodes: [], visitedNodeCount: 1, edgeExaminationCount: 0, maximumQueueSize: 1 },
      limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(graphTrace, 200))
    vi.stubGlobal('fetch', fetchMock)
    await expect(createGraphTraversalTrace({
      nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }], startNode: 'A',
    })).resolves.toEqual(graphTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/bfs/trace', expect.objectContaining({
      body: JSON.stringify({
        kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }], startNode: 'A',
      }),
    }))
  })

  it('includes an optional destination in a targeted BFS request', async () => {
    const graphTrace = {
      apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
      input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }], startNode: 'A', destination: 'B' },
      result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B'], parents: { B: 'A' }, unreachableNodes: [], pathFound: true, path: ['A', 'B'], pathEdgeCount: 1, unexploredNodes: [], visitedNodeCount: 2, edgeExaminationCount: 1, maximumQueueSize: 1 },
      limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(graphTrace, 200))
    vi.stubGlobal('fetch', fetchMock)
    const graph = { nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }], startNode: 'A', destination: 'B' }

    await expect(createGraphTraversalTrace(graph)).resolves.toEqual(graphTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/bfs/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'GRAPH_TRAVERSAL', ...graph }),
    }))
  })
})

describe('createDepthFirstSearchTrace', () => {
  it('submits the typed single-node graph request to DFS', async () => {
    const graphTrace = {
      apiVersion: '2.0', algorithm: { id: 'dfs', name: 'Depth-First Search', family: 'GRAPH_TRAVERSAL' },
      input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' },
      result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A'], parents: {}, unreachableNodes: [], visitedNodeCount: 1, edgeExaminationCount: 0, maximumStackSize: 1 },
      limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(graphTrace, 200))
    vi.stubGlobal('fetch', fetchMock)
    await expect(createDepthFirstSearchTrace({ nodes: ['A'], edges: [], startNode: 'A' }))
      .resolves.toEqual(graphTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/dfs/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' }),
    }))
  })
})

describe('createDijkstraTrace', () => {
  it('submits a strongly typed pathfinding request', async () => {
    const pathTrace = {
      apiVersion: '2.0', algorithm: { id: 'dijkstra', name: "Dijkstra's Algorithm", family: 'PATHFINDING' },
      input: { kind: 'PATHFINDING', nodes: ['A'], edges: [], startNode: 'A', destination: 'A' },
      result: { kind: 'PATHFINDING', pathFound: true, path: ['A'], totalCost: 0, settledOrder: ['A'], parents: {}, settledNodeCount: 1, relaxationAttemptCount: 0, successfulUpdateCount: 0, rejectedUpdateCount: 0, maximumFrontierSize: 1 },
      limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(pathTrace, 200))
    vi.stubGlobal('fetch', fetchMock)
    const graph = { nodes: ['A'], edges: [], startNode: 'A', destination: 'A' }

    await expect(createDijkstraTrace(graph)).resolves.toEqual(pathTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/dijkstra/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'PATHFINDING', ...graph }),
    }))
  })
})

describe('createSearchTrace', () => {
  it('submits a binary search request to its typed trace route', async () => {
    const searchTrace = {
      apiVersion: '2.0', algorithm: { id: 'binary-search', name: 'Binary Search', family: 'SEARCH' },
      input: { kind: 'SEARCH', values: [1, 3], target: 3 },
      result: { kind: 'SEARCH', found: true, foundIndex: 1, comparisons: 2 }, limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(searchTrace, 200))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createSearchTrace('binary-search', [1, 3], 3)).resolves.toEqual(searchTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/binary-search/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'SEARCH', values: [1, 3], target: 3 }),
    }))
  })
})

describe('createTreeTrace', () => {
  it('submits a lookup target only for the LOOKUP operation', async () => {
    const treeTrace = { apiVersion: '2.0', algorithm: { id: 'binary-search-tree', name: 'Binary Search Tree', family: 'TREE' }, input: { kind: 'TREE', insertionValues: [8], operation: { kind: 'LOOKUP', target: 8 } }, result: { kind: 'LOOKUP', found: true, target: 8, matchedNodeId: 1, visitedValues: [8], visitedNodeCount: 1, comparisonCount: 1, constructionComparisonCount: 0, constructionAttachmentCount: 1 }, limits: { maximumEvents: 10000 }, events: [] }
    const fetchMock = vi.fn().mockResolvedValue(response(treeTrace, 200))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createTreeTrace([8], { kind: 'LOOKUP', target: 8 })).resolves.toEqual(treeTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/binary-search-tree/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'TREE', insertionValues: [8], operation: { kind: 'LOOKUP', target: 8 } }),
    }))
  })
})

function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
