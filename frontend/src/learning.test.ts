import { describe, expect, it } from 'vitest'
import { explainEvent } from './learning'
import type { AlgorithmEvent, ComparisonResult } from './types'

function compare(result: ComparisonResult, values = [3, 2]): AlgorithmEvent {
  return { sequence: 1, type: 'COMPARE', state: values, data: { indices: [0, 1], operands: values, result }, pseudocodeLineId: 'compare-adjacent', sortedThrough: 0, pass: 1 }
}

describe('explainEvent', () => {
  it('explains greater, equal, and less comparisons', () => {
    expect(explainEvent(compare('GREATER'))).toContain('must be swapped')
    expect(explainEvent(compare('EQUAL', [2, 2]))).toContain('equal')
    expect(explainEvent(compare('LESS', [2, 3]))).toContain('pair is ordered')
  })

  it('explains swaps and completed passes', () => {
    expect(explainEvent({ sequence: 1, type: 'SWAP', state: [3, 2], data: { indices: [0, 1] }, pseudocodeLineId: 'swap-adjacent', sortedThrough: 0, pass: 1 })).toContain('Swap indices')
    expect(explainEvent({ sequence: 2, type: 'MARK_SORTED', state: [1, 2, 3], data: { fromIndex: 0, throughIndex: 2 }, pseudocodeLineId: 'complete-pass', sortedThrough: 2, pass: 2 })).toContain('positions 0 through 2')
  })

  it('explains select, read, and write events', () => {
    expect(explainEvent({ sequence: 1, type: 'SELECT', state: [2], data: { index: 0, value: 2 }, pseudocodeLineId: 'select-current', sortedThrough: 0, pass: 1 })).toContain('Select 2')
    expect(explainEvent({ sequence: 2, type: 'READ', state: [2, 1], data: { indices: [0, 1], readValues: [2, 1] }, pseudocodeLineId: 'read-adjacent', sortedThrough: 0, pass: 1 })).toContain('Read 2 and 1')
    expect(explainEvent({ sequence: 3, type: 'WRITE', state: [1, 2], data: { indices: [0, 1], writtenValues: [1, 2] }, pseudocodeLineId: 'write-swapped-values', sortedThrough: 0, pass: 1 })).toContain('Write 1 and 2')
  })
})
