import type { DoublyLinkedListEvent } from './types'

export const doublyLinkedListAdapter = {
  id: 'doubly-linked-list', title: 'Doubly Linked List', intro: 'See head and tail retain direct access to both ends.', warning: undefined,
  pseudocode: [
    { id: 'doubly-linked-list-allocate', text: 'allocate a new node for the label' },
    { id: 'doubly-linked-list-establish-endpoints', text: 'set both head and tail to the first node' },
    { id: 'doubly-linked-list-link-new-head', text: 'set the new node’s next link to head' },
    { id: 'doubly-linked-list-link-former-head', text: 'set the former head’s prev link to the new node' },
    { id: 'doubly-linked-list-move-head', text: 'move head to the new node' },
    { id: 'doubly-linked-list-link-new-tail', text: 'set the new node’s prev link to tail' },
    { id: 'doubly-linked-list-link-former-tail', text: 'set the former tail’s next link to the new node' },
    { id: 'doubly-linked-list-move-tail', text: 'move tail to the new node' },
  ],
  complexity: [{ label: 'Prepend', value: 'O(1)', explanation: 'Prepend rewires only head and its neighbor.' }, { label: 'Append', value: 'O(1)', explanation: 'Tail gives append direct access to the final node.' }],
  explain(event: DoublyLinkedListEvent) {
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'ENDPOINTS_ESTABLISHED') return `This first node is both head and tail.`
    if (event.type === 'HEAD_MOVED') return `Move head to node ${event.state.headOccurrenceId}.`
    if (event.type === 'TAIL_MOVED') return `Move tail to node ${event.state.tailOccurrenceId}.`
    return `Assign the ${event.type === 'NEXT_ASSIGNED' ? 'next' : 'prev'} link for node ${event.data.occurrenceId}.`
  },
}
