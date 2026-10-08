import type { LinkedListEvent } from './types'

export const linkedListAdapter = {
  id: 'linked-list', title: 'Linked List', intro: 'See a new node become the head of a singly linked list.', warning: undefined,
  pseudocode: [
    { id: 'linked-list-allocate', text: 'allocate a new node for the label' },
    { id: 'linked-list-initialize-next', text: 'set the new node’s next link to head' },
    { id: 'linked-list-move-head', text: 'move head to the new node' },
  ],
  complexity: [{ label: 'Time', value: 'O(1)', explanation: 'Prepend rewires only the new node and head.' }],
  explain(event: LinkedListEvent) {
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'NEXT_INITIALIZED') return `Set node ${event.data.occurrenceId}'s next link to ${event.data.nextOccurrenceId === null ? 'null' : `node ${event.data.nextOccurrenceId}`}.`
    return `Move head to node ${event.data.occurrenceId}.`
  },
}
