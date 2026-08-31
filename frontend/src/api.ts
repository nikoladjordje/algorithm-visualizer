import type { AlgorithmCatalogEntry, AlgorithmTrace, ProblemDetail } from './types'

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
  try { response = await fetch('/api/v1/algorithms', { signal }) } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new TraceRequestError('The algorithm catalog could not be reached.', 'unavailable')
  }
  if (!response.ok) throw new TraceRequestError('The algorithm catalog is temporarily unavailable.', 'unavailable')
  return await response.json() as AlgorithmCatalogEntry[]
}

export async function createAlgorithmTrace(algorithmId:string, values: number[], signal?:AbortSignal): Promise<AlgorithmTrace> {
  let response: Response
  try {
    response = await fetch(`/api/v1/algorithms/${algorithmId}/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new TraceRequestError('The visualizer service could not be reached.', 'unavailable')
  }

  if (response.ok) {
    const trace = await response.json() as { apiVersion?: string }
    if (trace.apiVersion !== '1.0') {
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

async function readProblem(response: Response): Promise<ProblemDetail | undefined> {
  try {
    return (await response.json()) as ProblemDetail
  } catch {
    return undefined
  }
}
