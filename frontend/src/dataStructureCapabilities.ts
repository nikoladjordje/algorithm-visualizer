import type { StructureOperation } from './types'
import { createLinkedListTrace, createQueueTrace, createStackTrace } from './api'
import { LinkedListVisualizer } from './components/LinkedListVisualizer'
import { QueueVisualizer } from './components/QueueVisualizer'
import { StackVisualizer } from './components/StackVisualizer'
import { queueAdapter } from './queueAdapter'
import { stackAdapter } from './stackAdapter'
import { linkedListAdapter } from './linkedListAdapter'
import type { StructureTrace } from './types'

export type DataStructureId = 'stack' | 'queue' | 'linked-list'
export type DataStructureOperation = StructureOperation['kind']
const commandNames: Record<DataStructureOperation, string> = { PUSH: 'push', POP: 'pop', ENQUEUE: 'enqueue', DEQUEUE: 'dequeue', PEEK: 'peek', PREPEND: 'prepend', APPEND: 'append', REMOVE_FIRST: 'removeFirst', FIND: 'find' }

export interface DataStructureCapability {
  id: DataStructureId
  title: 'Stack' | 'Queue' | 'Linked List'
  operations: DataStructureOperation[]
  valueOperations: DataStructureOperation[]
  commandNames: Record<DataStructureOperation, string>
  createTrace: (operations: StructureOperation[], signal?: AbortSignal) => Promise<StructureTrace>
  Visualizer: typeof StackVisualizer | typeof QueueVisualizer | typeof LinkedListVisualizer
  learningAdapter: typeof stackAdapter | typeof queueAdapter | typeof linkedListAdapter
}

export const dataStructureCapabilities: DataStructureCapability[] = [
  {
    id: 'stack',
    title: 'Stack',
    operations: ['PUSH', 'POP', 'PEEK'],
    valueOperations: ['PUSH'],
    commandNames,
    createTrace: createStackTrace,
    Visualizer: StackVisualizer,
    learningAdapter: stackAdapter,
  },
  {
    id: 'queue',
    title: 'Queue',
    operations: ['ENQUEUE', 'DEQUEUE', 'PEEK'],
    valueOperations: ['ENQUEUE'],
    commandNames,
    createTrace: createQueueTrace,
    Visualizer: QueueVisualizer,
    learningAdapter: queueAdapter,
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    operations: ['PREPEND', 'APPEND', 'REMOVE_FIRST', 'FIND'],
    valueOperations: ['PREPEND', 'APPEND', 'FIND'],
    commandNames,
    createTrace: (operations, signal) => createLinkedListTrace(operations as Array<{ kind: 'PREPEND' | 'APPEND' | 'FIND'; value: string } | { kind: 'REMOVE_FIRST' }>, signal),
    Visualizer: LinkedListVisualizer,
    learningAdapter: linkedListAdapter,
  },
]

export function getDataStructureCapability(id: DataStructureId) {
  return dataStructureCapabilities.find(capability => capability.id === id)!
}
