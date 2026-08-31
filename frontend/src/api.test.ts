import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInsertionSortTrace } from './api'
import type { AlgorithmTrace, ProblemDetail } from './types'

const trace: AlgorithmTrace = {
  apiVersion: '1.0',
  algorithm: { id: 'insertion-sort', name: 'Insertion Sort' },
  inputValues: [1],
  summary: { resultValues: [1], eventCount: 0, operationCounts: { SELECT: 0, READ: 0, COMPARE: 0, SWAP: 0, WRITE: 0, MARK_SORTED: 0 } },
  limits: { maxInputItems: 50, maxEvents: 10000 },
  events: [],
}

afterEach(() => vi.unstubAllGlobals())

describe('createInsertionSortTrace', () => {
  it('returns a successful trace', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(trace, 200)))
    await expect(createInsertionSortTrace([1])).resolves.toEqual(trace)
  })

  it('rejects unsupported API versions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...trace, apiVersion: '2.0' }, 200)))
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

function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
