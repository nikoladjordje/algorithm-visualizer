import type { StructureOperation } from './types'
import { createQueueTrace, createStackTrace } from './api'
import { QueueVisualizer } from './components/QueueVisualizer'
import { StackVisualizer } from './components/StackVisualizer'
import { queueAdapter } from './queueAdapter'
import { stackAdapter } from './stackAdapter'
import type { DataStructureTrace } from './types'

export type DataStructureId = 'stack' | 'queue'
export type DataStructureOperation = StructureOperation['kind']
const commandNames: Record<DataStructureOperation, string> = { PUSH: 'push', POP: 'pop', ENQUEUE: 'enqueue', DEQUEUE: 'dequeue', PEEK: 'peek' }

export interface DataStructureCapability {
  id: DataStructureId
  title: 'Stack' | 'Queue'
  operations: DataStructureOperation[]
  valueOperation: DataStructureOperation
  commandNames: Record<DataStructureOperation, string>
  createTrace: (operations: StructureOperation[], signal?: AbortSignal) => Promise<DataStructureTrace>
  Visualizer: typeof StackVisualizer | typeof QueueVisualizer
  learningAdapter: typeof stackAdapter | typeof queueAdapter
}

export const dataStructureCapabilities: DataStructureCapability[] = [
  {
    id: 'stack',
    title: 'Stack',
    operations: ['PUSH', 'POP', 'PEEK'],
    valueOperation: 'PUSH',
    commandNames,
    createTrace: createStackTrace,
    Visualizer: StackVisualizer,
    learningAdapter: stackAdapter,
  },
  {
    id: 'queue',
    title: 'Queue',
    operations: ['ENQUEUE', 'DEQUEUE', 'PEEK'],
    valueOperation: 'ENQUEUE',
    commandNames,
    createTrace: createQueueTrace,
    Visualizer: QueueVisualizer,
    learningAdapter: queueAdapter,
  },
]

export function getDataStructureCapability(id: DataStructureId) {
  return dataStructureCapabilities.find(capability => capability.id === id)!
}
