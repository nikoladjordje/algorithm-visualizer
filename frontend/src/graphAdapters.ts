import { createGraphTraversalTrace } from './api'
import type { AlgorithmAdapter } from './adapters'
import { graphPresets } from './graphPresets'
import type { GraphPreset } from './graphPresets'
import type { GraphPresentation } from './components/GraphVisualizer'
import type { GraphEdge, GraphTraversalEvent, GraphTraversalState, GraphTraversalTrace, NodeStatus } from './types'

export interface GraphAlgorithmAdapter {
  id: string
  family: 'GRAPH_TRAVERSAL'
  contractVersion: '2.0'
  title: string
  intro: string
  warning?: string
  inputWarning: (edges: readonly GraphEdge[]) => string | undefined
  pseudocode: AlgorithmAdapter['pseudocode']
  complexity: AlgorithmAdapter['complexity']
  presets: readonly GraphPreset[]
  createTrace: typeof createGraphTraversalTrace
  explain: (event: GraphTraversalEvent) => string
  complete: (result: GraphTraversalTrace['result']) => string
  completionAnnouncement: string
  metricsLabel: string
  metrics: (result: GraphTraversalTrace['result']) => { label: string; value: number }[]
  present: (nodes: string[], state?: GraphTraversalState, unreachableNodes?: string[]) => GraphPresentation
}

const BFS_LINES = [
  { id: 'bfs-initialize', text: 'mark start discovered; enqueue start' },
  { id: 'bfs-dequeue', text: 'dequeue node; mark active; visit node' },
  { id: 'bfs-examine-edge', text: 'examine the next neighbor in declaration order' },
  { id: 'bfs-enqueue-neighbor', text: 'mark neighbor discovered; record parent; enqueue' },
  { id: 'bfs-skip-neighbor', text: 'skip a neighbor that was already discovered' },
  { id: 'bfs-complete-node', text: 'mark node processed' },
  { id: 'bfs-complete-traversal', text: 'return traversal order' },
]

function explainGraphEvent(event: GraphTraversalEvent): string {
  switch (event.type) {
    case 'TRAVERSAL_INITIALIZED':
      return `Discover and enqueue ${event.data.startNode}.`
    case 'NODE_DEQUEUED':
      return `Dequeue and visit ${event.data.node}.`
    case 'EDGE_EXAMINED':
      return `Examine edge ${event.data.from}–${event.data.to}.`
    case 'NODE_DISCOVERED':
      return `Discover ${event.data.node} from ${event.data.parent} and enqueue it.`
    case 'ALREADY_DISCOVERED_SKIPPED':
      return `Skip ${event.data.to}; it was already discovered.`
    case 'NODE_COMPLETED':
      return `Finish ${event.data.node}; all of its neighbors were examined.`
    case 'TRAVERSAL_COMPLETED':
      return `Traversal complete: ${event.data.traversalOrder.join(', ')}.`
  }
}

const statusLabel: Record<NodeStatus, string> = {
  UNREACHED: 'unreached', DISCOVERED: 'discovered', ACTIVE: 'active', PROCESSED: 'processed',
}
const statusSymbol: Record<NodeStatus, string> = {
  UNREACHED: '○', DISCOVERED: '+', ACTIVE: '▶', PROCESSED: '✓',
}

export const breadthFirstAdapter: GraphAlgorithmAdapter = {
  id: 'bfs',
  family: 'GRAPH_TRAVERSAL',
  contractVersion: '2.0',
  title: 'Breadth-First Search',
  intro: 'Watch breadth-first search discover, visit, and finish nodes in queue order.',
  pseudocode: BFS_LINES,
  complexity: [
    { label: 'Time', value: 'O(V + E)', explanation: 'Each reachable node and edge is examined.' },
    { label: 'Space', value: 'O(V)', explanation: 'The queue and node state grow with the graph.' },
  ],
  presets: graphPresets,
  inputWarning: edges => edges.some(edge => edge.weight !== undefined)
    ? 'Breadth-first search ignores edge weights. Its search-tree routes minimize edge count, not total cost.'
    : undefined,
  createTrace: createGraphTraversalTrace,
  explain: explainGraphEvent,
  complete: result => `Breadth-first traversal is complete. Unreachable nodes: ${result.unreachableNodes.join(', ') || 'none'}.`,
  completionAnnouncement: 'Traversal complete.',
  metricsLabel: 'Traversal metrics',
  metrics: result => [
    { label: 'visited', value: result.visitedNodeCount },
    { label: 'edges examined', value: result.edgeExaminationCount },
    { label: 'max queue', value: result.maximumQueueSize },
  ],
  present(nodes, state, unreachableNodes) {
    const nodeStates = nodes.map(node => `${node}: ${statusLabel[state?.nodeStatuses[node] ?? 'UNREACHED']}`)
    const parents = nodes.flatMap(child => state?.parents[child] ? [`${child} from ${state.parents[child]}`] : [])
    const examinedEdge = state?.examinedEdge ? `${state.examinedEdge.from}–${state.examinedEdge.to}` : 'none'
    const completion = unreachableNodes === undefined ? '' : ` Unreachable nodes: ${unreachableNodes.join(', ') || 'none'}.`
    const description = `${nodeStates.join(', ')}. Queue: ${state?.queue.join(', ') || 'empty'}. Traversal order: ${state?.traversalOrder.join(', ') || 'empty'}. Examined edge: ${examinedEdge}. Parents: ${parents.join(', ') || 'none'}.${completion}`
    const treeEdges = Object.entries(state?.parents ?? {}).map(([child, parent]) => ({ from: child, to: parent }))
    const currentEdge = state?.examinedEdge ?? null
    return {
      title: 'Breadth-first traversal graph',
      description,
      nodes: Object.fromEntries(nodes.map(node => {
        const status = state?.nodeStatuses[node] ?? 'UNREACHED'
        return [node, { label: statusLabel[status], symbol: statusSymbol[status], style: status.toLowerCase() }]
      })),
      treeEdges,
      examinedEdge: currentEdge,
      rows: [
        { label: 'Queue', value: state?.queue.join(' → ') || 'Empty' },
        { label: 'Traversal order', value: state?.traversalOrder.join(' → ') || 'Empty' },
        { label: 'Node states', value: nodeStates.join('; ') },
        { label: 'Parents', value: parents.join('; ') || 'None' },
        { label: 'Examined edge', value: examinedEdge === 'none' ? 'None' : examinedEdge },
        ...(unreachableNodes === undefined ? [] : [{ label: 'Unreachable nodes', value: unreachableNodes.join(' → ') || 'None' }]),
      ],
    }
  },
}

export const graphAdapters: ReadonlyMap<string, GraphAlgorithmAdapter> = new Map([
  [breadthFirstAdapter.id, breadthFirstAdapter],
])
