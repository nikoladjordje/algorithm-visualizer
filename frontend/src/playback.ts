import type { AlgorithmEvent } from './types'

export function countEvents(events: AlgorithmEvent[], step: number) {
  return events.slice(0, step + 1).reduce(
    (counts, event) => ({
      comparisons: counts.comparisons + (event.type === 'COMPARE' ? 1 : 0),
      swaps: counts.swaps + (event.type === 'SWAP' ? 1 : 0),
    }),
    { comparisons: 0, swaps: 0 },
  )
}

export function nextStep(current: number, eventCount: number) {
  return Math.min(eventCount - 1, current + 1)
}

export function previousStep(current: number) {
  return Math.max(-1, current - 1)
}
