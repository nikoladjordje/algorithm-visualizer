import { describe, expect, it } from 'vitest'
import { linkedListAdapter } from './linkedListAdapter'

describe('linked list adapter', () => {
  it('explains head movement using the successor in the snapshot', () => {
    expect(linkedListAdapter.explain({
      sequence: 1, type: 'HEAD_MOVED', pseudocodeLineId: 'linked-list-advance-head',
      state: { kind: 'LINKED_LIST', nodes: [{ occurrenceId: 1, value: 'A', nextOccurrenceId: 2 }, { occurrenceId: 2, value: 'B', nextOccurrenceId: null }], headOccurrenceId: 2, activeOperationIndex: 2, allocatedOccurrenceId: null, inspectedOccurrenceId: null, linkedOccurrenceId: null },
      data: { kind: 'HEAD_MOVED', value: 'B', occurrenceId: 2, nextOccurrenceId: null },
    })).toBe('Move head to node 2.')
  })
})
