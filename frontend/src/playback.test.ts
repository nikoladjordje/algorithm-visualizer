import { describe, expect, it } from 'vitest'
import { countEvents, nextStep, previousStep } from './playback'
import type { AlgorithmEvent } from './types'

const events: AlgorithmEvent[] = [
  { sequence: 1, type: 'COMPARE', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'COMPARE', indices: [0, 1], items: [], result: 'GREATER' }, pseudocodeLineId: 'compare-adjacent' },
  { sequence: 2, type: 'SWAP', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'SWAP', indices: [0, 1] }, pseudocodeLineId: 'swap-adjacent' },
  { sequence: 3, type: 'COMPARE', state: { kind: 'SORTING', items: [], sortedRanges: [] }, data: { kind: 'COMPARE', indices: [1, 2], items: [], result: 'LESS' }, pseudocodeLineId: 'compare-adjacent' },
]

describe('playback helpers', () => {
  it('counts only events visible at the current step', () => {
    expect(countEvents(events, -1)).toEqual({ comparisons: 0, swaps: 0 })
    expect(countEvents(events, 1)).toEqual({ comparisons: 1, swaps: 1 })
    expect(countEvents(events, 2)).toEqual({ comparisons: 2, swaps: 1 })
  })

  it('keeps navigation inside trace bounds', () => {
    expect(previousStep(-1)).toBe(-1)
    expect(previousStep(1)).toBe(0)
    expect(nextStep(-1, 3)).toBe(0)
    expect(nextStep(2, 3)).toBe(2)
  })
})
