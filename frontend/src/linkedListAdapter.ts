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
    { id: 'linked-list-select-head', text: 'select the current head node' },
    { id: 'linked-list-advance-head', text: 'move head to its successor' },
    { id: 'linked-list-detach-head', text: 'clear the former head’s next link' },
    { id: 'linked-list-remove-detached', text: 'remove the detached former head' },
    { id: 'linked-list-empty-removal', text: 'the list is empty, so there is no head to remove' },
    { id: 'linked-list-match', text: 'stop at the first matching node' },
    { id: 'linked-list-not-found', text: 'reach null: the label is not in the list' },
  ],
  complexity: [
    { label: 'Prepend', value: 'O(1)', explanation: 'Prepend rewires only the new node and head.' },
    { label: 'Append', value: 'O(n)', explanation: 'Append walks from head to the final node before linking.' },
    { label: 'Remove first', value: 'O(1)', explanation: 'Remove first moves head and detaches only the former head.' },
    { label: 'Find', value: 'O(n)', explanation: 'Find inspects nodes from head until the first match or null.' },
  ],
  explain(event: LinkedListEvent) {
    if (event.type === 'NODE_ALLOCATED') return `Allocate node ${event.data.occurrenceId} for ${event.data.value}.`
    if (event.type === 'NEXT_INITIALIZED') return `Set node ${event.data.occurrenceId}'s next link to ${event.data.nextOccurrenceId === null ? 'null' : `node ${event.data.nextOccurrenceId}`}.`
    if (event.type === 'NODE_INSPECTED') return `Inspect node ${event.data.occurrenceId} and follow its next link.`
    if (event.type === 'FINAL_LINK_CREATED') return `Connect final node ${event.data.occurrenceId} to node ${event.data.nextOccurrenceId}.`
    if (event.type === 'HEAD_SELECTED') return `Select current head node ${event.data.occurrenceId}.`
    if (event.type === 'NODE_DETACHED') return `Clear node ${event.data.occurrenceId}'s next link so it is detached.`
    if (event.type === 'NODE_REMOVED') return `Remove detached node ${event.data.occurrenceId} from the live list.`
    if (event.type === 'EMPTY_STRUCTURE') return 'The list is empty, so remove first leaves it unchanged.'
    if (event.type === 'HEAD_MOVED') return `Move head to ${event.state.headOccurrenceId === null ? 'null' : `node ${event.state.headOccurrenceId}`}.`
    if (event.type === 'NODE_MATCHED') return `Node ${event.data.occurrenceId} is the first match for ${event.data.value}.`
    if (event.type === 'SEARCH_NOT_FOUND') return `Reached null: ${event.data.value} is not in the list.`
    return `Move head to node ${event.data.occurrenceId}.`
  },
}
