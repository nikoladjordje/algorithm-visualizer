import type { DoublyLinkedListEvent } from './types'

export const doublyLinkedListAdapter = {
  id: 'doubly-linked-list', title: 'Doubly Linked List', intro: 'See head and tail retain direct access to both ends.', warning: undefined,
  pseudocode: [
    { id: 'doubly-linked-list-empty-removal', text: 'if empty, report that nothing was removed' },
    { id: 'doubly-linked-list-select-endpoint', text: 'select the endpoint node to remove' },
    { id: 'doubly-linked-list-remove-move-endpoint', text: 'move the endpoint to its neighbor or clear both endpoints' },
    { id: 'doubly-linked-list-clear-neighbor', text: 'clear the neighbor’s link to the former endpoint' },
    { id: 'doubly-linked-list-detach', text: 'clear the former endpoint’s links' },
    { id: 'doubly-linked-list-removal-complete', text: 'remove the detached node from the list' },
    { id: 'doubly-linked-list-allocate', text: 'allocate a new node for the label' },
    { id: 'doubly-linked-list-establish-endpoints', text: 'set both head and tail to the first node' },
    { id: 'doubly-linked-list-link-new-head', text: 'set the new node’s next link to head' },
    { id: 'doubly-linked-list-link-former-head', text: 'set the former head’s prev link to the new node' },
    { id: 'doubly-linked-list-move-head', text: 'move head to the new node' },
    { id: 'doubly-linked-list-link-new-tail', text: 'set the new node’s prev link to tail' },
    { id: 'doubly-linked-list-link-former-tail', text: 'set the former tail’s next link to the new node' },
    { id: 'doubly-linked-list-move-tail', text: 'move tail to the new node' },
  ],
  complexity: [{ label: 'Prepend', value: 'O(1)', explanation: 'Prepend rewires only head and its neighbor.' }, { label: 'Append', value: 'O(1)', explanation: 'Tail gives append direct access to the final node.' }, { label: 'Remove first or last', value: 'O(1)', explanation: 'Each endpoint and its neighbor can be updated directly.' }],
  explain(event: DoublyLinkedListEvent) {
    if (event.type === 'EMPTY_REMOVAL') return 'Nothing to remove: the list is empty.'
    if (event.type === 'ENDPOINT_SELECTED') return `Select endpoint node ${event.data.occurrenceId} for removal.`
    if (event.type === 'PREV_CLEARED' || event.type === 'NEXT_CLEARED') return `Clear the ${event.type === 'PREV_CLEARED' ? 'prev' : 'next'} link of node ${event.data.occurrenceId}.`
    if (event.type === 'NODE_DETACHED') return `Detach node ${event.data.occurrenceId} and clear its links.`
    if (event.type === 'REMOVAL_COMPLETED') return `Removed ${event.data.value} from node ${event.data.occurrenceId}.`
    if ((event.type === 'HEAD_MOVED' || event.type === 'TAIL_MOVED') && event.pseudocodeLineId === 'doubly-linked-list-remove-move-endpoint') return `Move ${event.type === 'HEAD_MOVED' ? 'head' : 'tail'} to ${event.data.relatedOccurrenceId === null ? 'null; both endpoints are now null' : `node ${event.data.relatedOccurrenceId}`}.`
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'ENDPOINTS_ESTABLISHED') return `This first node is both head and tail.`
    if (event.type === 'HEAD_MOVED') return `Move head to node ${event.state.headOccurrenceId}.`
    if (event.type === 'TAIL_MOVED') return `Move tail to node ${event.state.tailOccurrenceId}.`
    return `Assign the ${event.type === 'NEXT_ASSIGNED' ? 'next' : 'prev'} link for node ${event.data.occurrenceId}.`
  },
}
