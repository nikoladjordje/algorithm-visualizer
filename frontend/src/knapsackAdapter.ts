import type { DynamicProgrammingEvent } from './types'

export const knapsackAdapter = {
  id: 'zero-one-knapsack',
  title: '0/1 Knapsack',
  intro: 'See how a dynamic-programming table records the best value for each small subproblem.',
  warning: undefined,
  pseudocode: [
    { id: 'knapsack-initialize-base-cases', text: 'set zero-item and zero-capacity base cases to 0' },
    { id: 'knapsack-evaluate-cell', text: 'compare excluding and including the item' },
    { id: 'knapsack-commit-cell', text: 'commit the best value for this subproblem' },
  ],
  complexity: [
    { label: 'Time', value: 'O(nW)', explanation: 'Tabulation evaluates one cell for every item and capacity.' },
    { label: 'Space', value: 'O(nW)', explanation: 'The table keeps the result of each subproblem.' },
  ],
  explain(event: DynamicProgrammingEvent): string {
    if (event.type === 'BASE_CASES_INITIALIZED') return 'Base cases are 0: no items or no capacity cannot produce value.'
    const itemName = event.state.items[event.state.activeItemCount - 1]?.name ?? 'this item'
    if (event.type === 'CELL_EVALUATED') return event.data.unavailableCandidateReason
      ? `${itemName} cannot fit: ${event.data.unavailableCandidateReason.toLowerCase()}. Exclude it for ${event.data.excludeValue}.`
      : `Compare excluding ${itemName} (${event.data.excludeValue}) with including it (${event.data.includeValue}).`
    return `Commit ${event.data.committedValue} for ${itemName} with capacity ${event.state.activeCapacity} by ${event.data.selectedBranch?.toLowerCase() ?? 'choosing'} the item.`
  },
}
