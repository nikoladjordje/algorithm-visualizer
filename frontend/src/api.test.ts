import { afterEach, describe, expect, it, vi } from 'vitest'
import { createGraphTraversalTrace, createInsertionSortTrace } from './api'
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
  it('submits the typed single-node graph request', async () => {
    const graphTrace = {
      apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
      input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' },
      result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A'], parents: {}, unreachableNodes: [], visitedNodeCount: 1, edgeExaminationCount: 0, maximumQueueSize: 1 },
      limits: { maximumEvents: 10000 }, events: [],
    }
    const fetchMock = vi.fn().mockResolvedValue(response(graphTrace, 200))
    vi.stubGlobal('fetch', fetchMock)
    await expect(createGraphTraversalTrace('A')).resolves.toEqual(graphTrace)
    expect(fetchMock).toHaveBeenCalledWith('/api/v2/algorithms/bfs/trace', expect.objectContaining({
      body: JSON.stringify({ kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' }),
    }))
  })
})

function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
