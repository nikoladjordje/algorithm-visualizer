import type { DequeEvent } from './types'

export const dequeAdapter = {
  id: 'deque', title: 'Deque', intro: 'Add and read values at both the front and rear.', warning: undefined,
  pseudocode: [
    { id: 'doubly-linked-list-allocate', text: 'allocate a new node for the label' },
    { id: 'doubly-linked-list-establish-endpoints', text: 'set front and rear to the first node' },
    { id: 'doubly-linked-list-link-new-head', text: 'set the new node’s next link to front' },
    { id: 'doubly-linked-list-link-former-head', text: 'set the former front’s prev link to the new node' },
    { id: 'doubly-linked-list-move-head', text: 'move front to the new node' },
    { id: 'doubly-linked-list-link-new-tail', text: 'set the new node’s prev link to rear' },
    { id: 'doubly-linked-list-link-former-tail', text: 'set the former rear’s next link to the new node' },
    { id: 'doubly-linked-list-move-tail', text: 'move rear to the new node' },
    { id: 'deque-peek-first', text: 'read front, or report an empty deque' },
    { id: 'deque-peek-last', text: 'read rear, or report an empty deque' },
  ],
  complexity: [{ label: 'Add first or last', value: 'O(1)', explanation: 'Both ends are directly accessible.' }, { label: 'Peek first or last', value: 'O(1)', explanation: 'Reading an endpoint does not change the deque.' }],
  explain(event: DequeEvent) {
    if (event.type === 'EMPTY_PEEK') return 'Nothing to read: the deque is empty.'
    if (event.type === 'ENDPOINT_PEEKED') return `Read ${event.pseudocodeLineId === 'deque-peek-first' ? 'front' : 'rear'}: ${event.data.value}, node ${event.data.occurrenceId}.`
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'ENDPOINTS_ESTABLISHED') return 'This first node is both front and rear.'
    if (event.type === 'HEAD_MOVED') return `Move front to node ${event.state.frontOccurrenceId}.`
    if (event.type === 'TAIL_MOVED') return `Move rear to node ${event.state.rearOccurrenceId}.`
    return `Assign the ${event.type === 'NEXT_ASSIGNED' ? 'next' : 'prev'} link for node ${event.data.occurrenceId}.`
  },
}
