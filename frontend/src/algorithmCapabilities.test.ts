import { describe, expect, it } from 'vitest'
import { resolveAlgorithmAdapter } from './algorithmCapabilities'

describe('algorithm capabilities', () => {
  it('recognizes the separate Doubly Linked List catalog entry', () => {
    expect(resolveAlgorithmAdapter({ id: 'doubly-linked-list', name: 'Doubly Linked List', family: 'DATA_STRUCTURES', contractVersion: '2.0', constraints: { kind: 'DATA_STRUCTURES', minimumOperations: 1, maximumOperations: 50, minimumValueLength: 1, maximumValueLength: 40, operations: ['PREPEND', 'APPEND', 'REMOVE_FIRST', 'REMOVE_LAST'] } })).toMatchObject({ family: 'DATA_STRUCTURES', adapter: { id: 'doubly-linked-list' } })
  })
})
