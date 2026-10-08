import { describe, expect, it } from 'vitest'
import { dataStructureCapabilities, getDataStructureCapability } from './dataStructureCapabilities'

describe('data structure capabilities', () => {
  it('describes Stack, Queue, and Linked List authoring without structure-specific branches', () => {
    expect(dataStructureCapabilities.map(capability => capability.id)).toEqual(['stack', 'queue', 'linked-list'])
    expect(getDataStructureCapability('stack')).toMatchObject({
      valueOperation: 'PUSH',
      operations: ['PUSH', 'POP', 'PEEK'],
      commandNames: { PUSH: 'push', POP: 'pop', PEEK: 'peek' },
    })
    expect(getDataStructureCapability('queue')).toMatchObject({
      valueOperation: 'ENQUEUE',
      operations: ['ENQUEUE', 'DEQUEUE', 'PEEK'],
      commandNames: { ENQUEUE: 'enqueue', DEQUEUE: 'dequeue', PEEK: 'peek' },
    })
    expect(getDataStructureCapability('linked-list')).toMatchObject({
      valueOperation: 'PREPEND',
      operations: ['PREPEND'],
      commandNames: { PREPEND: 'prepend' },
    })
  })
})
