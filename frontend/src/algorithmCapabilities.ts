import { adapters, binarySearchAdapter, linearSearchAdapter } from './adapters'
import type { AlgorithmAdapter } from './adapters'
import { graphAdapters } from './graphAdapters'
import type { GraphAlgorithmAdapter } from './graphAdapters'
import type { AlgorithmCatalogEntry } from './types'
import { treeAdapter } from './treeAdapter'

export type AlgorithmCapability =
  | { family: 'SORTING'; adapter: AlgorithmAdapter }
  | { family: 'SEARCH'; adapter: AlgorithmAdapter }
  | { family: 'GRAPH_TRAVERSAL'; adapter: GraphAlgorithmAdapter }
  | { family: 'PATHFINDING'; adapter: GraphAlgorithmAdapter }
  | { family: 'TREE'; adapter: typeof treeAdapter }

export function resolveAlgorithmAdapter(entry?: AlgorithmCatalogEntry): AlgorithmCapability | undefined {
  if (!entry || entry.contractVersion !== '2.0') return undefined
  if (entry.family === 'SORTING' && Object.hasOwn(adapters, entry.id)) {
    return { family: 'SORTING', adapter: adapters[entry.id] }
  }
  if (entry.family === 'SEARCH' && entry.id === 'linear-search') return { family: 'SEARCH', adapter: linearSearchAdapter }
  if (entry.family === 'SEARCH' && entry.id === 'binary-search') return { family: 'SEARCH', adapter: binarySearchAdapter }
  if (entry.family === 'TREE' && entry.id === 'binary-search-tree') return { family: 'TREE', adapter: treeAdapter }
  const adapter = graphAdapters.get(entry.id)
  if (adapter && entry.family === adapter.family && entry.contractVersion === adapter.contractVersion) {
    return { family: adapter.family, adapter }
  }
  return undefined
}
