import type { DataStructureEvent } from './types'

export const queueAdapter = {
  id: 'queue', title: 'Queue', intro: 'See how values enter at the rear and leave from the front.', warning: undefined,
  pseudocode: [
    { id: 'queue-enqueue', text: 'enqueue the value at rear' },
    { id: 'queue-dequeue', text: 'remove and return the value at Front' },
    { id: 'queue-peek', text: 'read the value at Front without removing it' },
    { id: 'queue-empty', text: 'report an empty-structure outcome' },
  ],
  complexity: [{ label: 'Time', value: 'O(1)', explanation: 'Each operation accesses the Front or rear.' }],
  explain(event: DataStructureEvent) {
    if (event.type === 'EMPTY_STRUCTURE') return `${event.data.operation.toLowerCase()} cannot proceed because the queue is empty; later operations still run.`
    return event.type === 'ENQUEUE' ? `Enqueue ${event.data.value} at rear.` : event.type === 'DEQUEUE' ? `Dequeue ${event.data.value} from Front.` : `Peek at ${event.data.value} at Front.`
  },
}
