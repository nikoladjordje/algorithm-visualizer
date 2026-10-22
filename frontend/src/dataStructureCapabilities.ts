import type { StructureOperation } from './types'
import { createDequeTrace, createDoublyLinkedListTrace, createLinkedListTrace, createQueueTrace, createStackTrace } from './api'
import { DequeVisualizer } from './components/DequeVisualizer'
import { dequeAdapter } from './dequeAdapter'
import { DoublyLinkedListVisualizer } from './components/DoublyLinkedListVisualizer'
import { LinkedListVisualizer } from './components/LinkedListVisualizer'
import { QueueVisualizer } from './components/QueueVisualizer'
import { StackVisualizer } from './components/StackVisualizer'
import { queueAdapter } from './queueAdapter'
import { stackAdapter } from './stackAdapter'
import { linkedListAdapter } from './linkedListAdapter'
import { doublyLinkedListAdapter } from './doublyLinkedListAdapter'
import type { StructureTrace } from './types'

export type DataStructureId = 'stack' | 'queue' | 'linked-list' | 'doubly-linked-list' | 'deque'
export type DataStructureOperation = StructureOperation['kind']
const commandNames: Record<DataStructureOperation, string> = { PUSH: 'push', POP: 'pop', ENQUEUE: 'enqueue', DEQUEUE: 'dequeue', PEEK: 'peek', PREPEND: 'prepend', APPEND: 'append', REMOVE_FIRST: 'removeFirst', REMOVE_LAST: 'removeLast', FIND: 'find', ADD_FIRST: 'addFirst', ADD_LAST: 'addLast', PEEK_FIRST: 'peekFirst', PEEK_LAST: 'peekLast' }

export interface DataStructureCapability {
  id: DataStructureId
  title: 'Stack' | 'Queue' | 'Linked List' | 'Doubly Linked List' | 'Deque'
  operations: DataStructureOperation[]
  valueOperations: DataStructureOperation[]
  commandNames: Record<DataStructureOperation, string>
  createTrace: (operations: StructureOperation[], signal?: AbortSignal) => Promise<StructureTrace>
  Visualizer: typeof StackVisualizer | typeof QueueVisualizer | typeof LinkedListVisualizer | typeof DoublyLinkedListVisualizer | typeof DequeVisualizer
  learningAdapter: typeof stackAdapter | typeof queueAdapter | typeof linkedListAdapter | typeof doublyLinkedListAdapter | typeof dequeAdapter
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
  {
    id: 'doubly-linked-list',
    title: 'Doubly Linked List',
    operations: ['PREPEND', 'APPEND', 'REMOVE_FIRST', 'REMOVE_LAST'],
    valueOperations: ['PREPEND', 'APPEND'],
    commandNames,
    createTrace: (operations, signal) => createDoublyLinkedListTrace(operations as Array<{ kind: 'PREPEND' | 'APPEND'; value: string } | { kind: 'REMOVE_FIRST' | 'REMOVE_LAST' }>, signal),
    Visualizer: DoublyLinkedListVisualizer,
    learningAdapter: doublyLinkedListAdapter,
  },
  {
    id: 'deque',
    title: 'Deque',
    operations: ['ADD_FIRST', 'ADD_LAST', 'PEEK_FIRST', 'PEEK_LAST'],
    valueOperations: ['ADD_FIRST', 'ADD_LAST'],
    commandNames,
    createTrace: (operations, signal) => createDequeTrace(operations as Array<{ kind: 'ADD_FIRST' | 'ADD_LAST'; value: string } | { kind: 'PEEK_FIRST' | 'PEEK_LAST' }>, signal),
    Visualizer: DequeVisualizer,
    learningAdapter: dequeAdapter,
  },
]

export function getDataStructureCapability(id: DataStructureId) {
  return dataStructureCapabilities.find(capability => capability.id === id)!
}
