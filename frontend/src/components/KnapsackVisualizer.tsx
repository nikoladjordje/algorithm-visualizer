import type { DynamicProgrammingState } from '../types'

export function KnapsackVisualizer({ state }: { state?: DynamicProgrammingState }) {
  const table = state?.table ?? [[0, 0], [0, 0]]
  return <div className="knapsack-visualizer"><table aria-label="Knapsack table"><caption>Best value for each item-prefix and capacity</caption><thead><tr><th scope="col">Items</th>{table[0].map((_, capacity) => <th key={capacity} scope="col">Capacity {capacity}</th>)}</tr></thead><tbody>{table.map((row, itemCount) => <tr key={itemCount}>{<th scope="row">{itemCount === 0 ? 'No items' : state?.items[itemCount - 1]?.name ?? `First ${itemCount} items`}</th>}{row.map((value, capacity) => <td key={capacity} aria-current={itemCount === state?.activeItemCount && capacity === state?.activeCapacity ? 'true' : undefined}>{value}</td>)}</tr>)}</tbody></table></div>
}
