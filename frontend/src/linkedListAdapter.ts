import type { LinkedListEvent } from './types'

export const linkedListAdapter = {
  id: 'linked-list', title: 'Linked List', intro: 'See nodes become the head or walk from head to the final link.', warning: undefined,
  pseudocode: [
    { id: 'linked-list-allocate', text: 'allocate a new node for the label' },
    { id: 'linked-list-initialize-next', text: 'set the new node’s next link to head' },
    { id: 'linked-list-move-head', text: 'move head to the new node' },
    { id: 'linked-list-establish-head', text: 'set head to the first node' },
    { id: 'linked-list-inspect-node', text: 'inspect the current node and follow next' },
    { id: 'linked-list-link-final-node', text: 'connect the final node to the new node' },
  ],
  complexity: [
    { label: 'Prepend', value: 'O(1)', explanation: 'Prepend rewires only the new node and head.' },
    { label: 'Append', value: 'O(n)', explanation: 'Append walks from head to the final node before linking.' },
  ],
  explain(event: LinkedListEvent) {
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'NEXT_INITIALIZED') return `Set node ${event.data.occurrenceId}'s next link to ${event.data.nextOccurrenceId === null ? 'null' : `node ${event.data.nextOccurrenceId}`}.`
    if (event.type === 'NODE_INSPECTED') return `Inspect node ${event.data.occurrenceId} and follow its next link.`
    if (event.type === 'FINAL_LINK_CREATED') return `Connect final node ${event.data.occurrenceId} to node ${event.data.nextOccurrenceId}.`
    return `Move head to node ${event.data.occurrenceId}.`
  },
}
