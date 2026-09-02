import type { AlgorithmCatalogEntry, AlgorithmTrace, GraphTraversalTrace, ProblemDetail } from './types'

export class TraceRequestError extends Error {
  readonly kind: 'validation' | 'unavailable'
  readonly problem?: ProblemDetail

  constructor(
    message: string,
    kind: 'validation' | 'unavailable',
    problem?: ProblemDetail,
  ) {
    super(message)
    this.name = 'TraceRequestError'
    this.kind = kind
    this.problem = problem
  }
}

export async function fetchAlgorithmCatalog(signal?: AbortSignal): Promise<AlgorithmCatalogEntry[]> {
  let response: Response
  try { response = await fetch('/api/v2/algorithms', { signal }) } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new TraceRequestError('The algorithm catalog could not be reached.', 'unavailable')
  }
  if (!response.ok) throw new TraceRequestError('The algorithm catalog is temporarily unavailable.', 'unavailable')
  return await response.json() as AlgorithmCatalogEntry[]
}

export async function createAlgorithmTrace(algorithmId:string, values: number[], signal?:AbortSignal): Promise<AlgorithmTrace> {
  let response: Response
  try {
    response = await fetch(`/api/v2/algorithms/${algorithmId}/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'SORTING', values }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new TraceRequestError('The visualizer service could not be reached.', 'unavailable')
  }

  if (response.ok) {
    const trace = await response.json() as { apiVersion?: string }
    if (trace.apiVersion !== '2.0') {
      throw new TraceRequestError(`Unsupported trace API version: ${trace.apiVersion ?? 'missing'}.`, 'unavailable')
    }
    return trace as AlgorithmTrace
  }

  const problem = await readProblem(response)
  if (response.status >= 400 && response.status < 500) {
    throw new TraceRequestError(problem?.detail ?? 'Check the array and try again.', 'validation', problem)
  }
  throw new TraceRequestError('The visualizer service is temporarily unavailable.', 'unavailable', problem)
}

export function createInsertionSortTrace(values:number[]):Promise<AlgorithmTrace>{ return createAlgorithmTrace('insertion',values) }

export async function createGraphTraversalTrace(node: string, signal?: AbortSignal): Promise<GraphTraversalTrace> {
  return requestTrace('/api/v2/algorithms/bfs/trace', {
    kind: 'GRAPH_TRAVERSAL', nodes: [node], edges: [], startNode: node,
  }, signal) as Promise<GraphTraversalTrace>
}

async function requestTrace(url: string, body: unknown, signal?: AbortSignal): Promise<AlgorithmTrace | GraphTraversalTrace> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new TraceRequestError('The visualizer service could not be reached.', 'unavailable')
  }
  if (response.ok) {
    const trace = await response.json() as { apiVersion?: string }
    if (trace.apiVersion !== '2.0') throw new TraceRequestError(`Unsupported trace API version: ${trace.apiVersion ?? 'missing'}.`, 'unavailable')
    return trace as AlgorithmTrace | GraphTraversalTrace
  }
  const problem = await readProblem(response)
  if (response.status >= 400 && response.status < 500) throw new TraceRequestError(problem?.detail ?? 'Check the input and try again.', 'validation', problem)
  throw new TraceRequestError('The visualizer service is temporarily unavailable.', 'unavailable', problem)
}

async function readProblem(response: Response): Promise<ProblemDetail | undefined> {
  try {
    return (await response.json()) as ProblemDetail
  } catch {
    return undefined
  }
}
