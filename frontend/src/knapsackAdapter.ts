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
    { id: 'knapsack-reconstruct-start', text: 'start at the final subproblem and backtrack through the table' },
    { id: 'knapsack-reconstruct-item', text: 'select an item only when its row improves the best value' },
    { id: 'knapsack-reconstruct-complete', text: 'report the selected items and their total weight' },
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
    if (event.type === 'RECONSTRUCTION_STARTED') return 'Start backtracking at the final table cell.'
    if (event.type === 'ITEM_SELECTED') return `Select ${event.data.itemName}; it improved the best value for this subproblem.`
    if (event.type === 'ITEM_EXCLUDED') return `Exclude ${event.data.itemName}; the same best value was already available without it.`
    if (event.type === 'RECONSTRUCTION_COMPLETED') return 'Backtracking is complete.'
    return `Commit ${event.data.committedValue} for ${itemName} with capacity ${event.state.activeCapacity} by ${event.data.selectedBranch?.toLowerCase() ?? 'choosing'} the item.`
  },
}
