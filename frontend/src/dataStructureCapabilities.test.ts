import { describe, expect, it } from 'vitest'
import { dataStructureCapabilities, getDataStructureCapability } from './dataStructureCapabilities'

describe('data structure capabilities', () => {
  it('describes Stack and Queue authoring without structure-specific branches', () => {
    expect(dataStructureCapabilities.map(capability => capability.id)).toEqual(['stack', 'queue'])
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
  })
})
