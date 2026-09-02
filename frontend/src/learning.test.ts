import { describe, expect, it } from 'vitest'
import { explainEvent } from './learning'
import type { AlgorithmEvent, ComparisonResult } from './types'

function compare(result: ComparisonResult, values = [3, 2]): AlgorithmEvent {
  const items = values.map((value, id) => ({ id, value }))
  return { sequence: 1, type: 'COMPARE', state: { kind: 'SORTING', items, sortedRanges: [] }, data: { kind: 'COMPARE', indices: [0, 1], items, result }, pseudocodeLineId: 'compare-adjacent' }
}

describe('explainEvent', () => {
  it('explains greater, equal, and less comparisons', () => {
    expect(explainEvent(compare('GREATER'))).toContain('must be swapped')
    expect(explainEvent(compare('EQUAL', [2, 2]))).toContain('equal')
    expect(explainEvent(compare('LESS', [2, 3]))).toContain('pair is ordered')
  })

  it('explains swaps and completed passes', () => {
    expect(explainEvent({ sequence: 1, type: 'SWAP', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'SWAP', indices: [0, 1] }, pseudocodeLineId: 'swap-adjacent' })).toContain('Swap indices')
    expect(explainEvent({ sequence: 2, type: 'MARK_SORTED', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'MARK_SORTED', fromIndex: 0, throughIndex: 2 }, pseudocodeLineId: 'complete-pass' })).toContain('Positions 0 through 2')
  })

  it('explains select, read, and write events', () => {
    expect(explainEvent({ sequence: 1, type: 'SELECT', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'SELECT', index: 0, item: { id: 0, value: 2 } }, pseudocodeLineId: 'select-current' })).toContain('Select 2')
    expect(explainEvent({ sequence: 2, type: 'READ', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'READ', indices: [0, 1], items: [{ id: 0, value: 2 }, { id: 1, value: 1 }] }, pseudocodeLineId: 'read-adjacent' })).toContain('Read 2 and 1')
    expect(explainEvent({ sequence: 3, type: 'WRITE', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'WRITE', indices: [0, 1], items: [{ id: 1, value: 1 }, { id: 0, value: 2 }] }, pseudocodeLineId: 'write-swapped-values' })).toContain('Write 1 and 2')
  })
})
