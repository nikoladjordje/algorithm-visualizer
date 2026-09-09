import { adapters } from './adapters'
import type { AlgorithmAdapter } from './adapters'
import { graphAdapters } from './graphAdapters'
import type { GraphAlgorithmAdapter } from './graphAdapters'
import type { AlgorithmCatalogEntry } from './types'

export type AlgorithmCapability =
  | { family: 'SORTING'; adapter: AlgorithmAdapter }
  | { family: 'GRAPH_TRAVERSAL'; adapter: GraphAlgorithmAdapter }

export function resolveAlgorithmAdapter(entry?: AlgorithmCatalogEntry): AlgorithmCapability | undefined {
  if (!entry || entry.contractVersion !== '2.0') return undefined
  if (entry.family === 'SORTING' && Object.hasOwn(adapters, entry.id)) {
    return { family: 'SORTING', adapter: adapters[entry.id] }
  }
  const adapter = graphAdapters.get(entry.id)
  if (adapter && entry.family === adapter.family && entry.contractVersion === adapter.contractVersion) {
    return { family: adapter.family, adapter }
  }
  return undefined
}
