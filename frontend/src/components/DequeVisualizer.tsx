import type { DequeState } from '../types'
import { DoublyLinkedListVisualizer } from './DoublyLinkedListVisualizer'

export function DequeVisualizer({ state }: { state?: DequeState }) {
  return <DoublyLinkedListVisualizer deque state={state && { ...state, kind: 'DOUBLY_LINKED_LIST', headOccurrenceId: state.frontOccurrenceId, tailOccurrenceId: state.rearOccurrenceId }} />
}
