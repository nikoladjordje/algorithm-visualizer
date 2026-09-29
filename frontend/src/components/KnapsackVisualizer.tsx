import type { DynamicProgrammingState, DynamicProgrammingTrace } from '../types'

export function KnapsackVisualizer({ state, result, completed }: {
  state?: DynamicProgrammingState
  result?: DynamicProgrammingTrace['result']
  completed?: boolean
}) {
  const table = state?.table ?? [[0, 0], [0, 0]]
  const selectedNames = state?.selectedItems.map(item => item.name) ?? []
  return <div className="knapsack-visualizer"><table aria-label="Knapsack table"><caption>Best value for each item-prefix and capacity</caption><thead><tr><th scope="col">Items</th>{table[0].map((_, capacity) => <th key={capacity} scope="col">Capacity {capacity}</th>)}</tr></thead><tbody>{table.map((row, itemCount) => { const isSelected = itemCount > 0 && (state?.selectedItemIndices?.includes(itemCount - 1) ?? false); return <tr key={itemCount} data-selected={isSelected || undefined}><th scope="row">{itemCount === 0 ? 'No items' : state?.items[itemCount - 1]?.name ?? `First ${itemCount} items`}</th>{row.map((value, capacity) => { const active = itemCount === state?.activeItemCount && capacity === state?.activeCapacity; const dependency = state?.dependencyCells?.some(cell => cell.itemCount === itemCount && cell.capacity === capacity); return <td key={capacity} aria-current={active ? 'true' : undefined} data-dependency={dependency || undefined}>{value}{active ? <span className="sr-only"> (active subproblem)</span> : dependency ? <span className="sr-only"> (next backtrack cell)</span> : null}</td> })}</tr> })}</tbody></table>{state?.phase === 'RECONSTRUCTION' && <p className="knapsack-selection" aria-live="polite">Selected so far: {selectedNames.length ? selectedNames.join(', ') : 'none'}</p>}{completed && result && <section className="knapsack-result" aria-label="Knapsack result"><strong>Maximum value: {result.maximumValue}</strong><span>Total selected weight: {result.totalSelectedWeight}</span><span>Selected items: {result.selectedItems.length ? result.selectedItems.map(item => item.name).join(', ') : 'None'}</span></section>}</div>
}
