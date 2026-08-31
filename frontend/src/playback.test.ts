import { describe, expect, it } from 'vitest'
import { countEvents, nextStep, previousStep } from './playback'
import type { AlgorithmEvent } from './types'

const events: AlgorithmEvent[] = [
  { sequence: 1, type: 'COMPARE', state: [2, 1], data: { indices: [0, 1], operands: [2, 1], result: 'GREATER' }, pseudocodeLineId: 'compare-adjacent', sortedThrough: 0, pass: 1 },
  { sequence: 2, type: 'SWAP', state: [2, 1], data: { indices: [0, 1] }, pseudocodeLineId: 'swap-adjacent', sortedThrough: 0, pass: 1 },
  { sequence: 3, type: 'COMPARE', state: [1, 2], data: { indices: [1, 2], operands: [1, 2], result: 'LESS' }, pseudocodeLineId: 'compare-adjacent', sortedThrough: 1, pass: 2 },
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
