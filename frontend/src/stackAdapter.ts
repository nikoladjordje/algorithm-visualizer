import type { DataStructureEvent } from './types'

export const stackAdapter = {
  id: 'stack', title: 'Stack', intro: 'See how the top of a stack changes one operation at a time.', warning: undefined,
  pseudocode: [
    { id: 'stack-push', text: 'push the value onto Top' },
    { id: 'stack-pop', text: 'remove and return the value at Top' },
    { id: 'stack-peek', text: 'read the value at Top without removing it' },
    { id: 'stack-empty', text: 'report an empty-structure outcome' },
  ],
  complexity: [{ label: 'Time', value: 'O(1)', explanation: 'Each operation accesses only the Top.' }],
  explain(event: DataStructureEvent) {
    if (event.type === 'EMPTY_STRUCTURE') return `${event.data.operation.toLowerCase()} cannot proceed because the stack is empty; later operations still run.`
    return event.type === 'PUSH' ? `Push ${event.data.value} onto Top.` : event.type === 'POP' ? `Pop ${event.data.value} from Top.` : `Peek at ${event.data.value} at Top.`
  },
}
