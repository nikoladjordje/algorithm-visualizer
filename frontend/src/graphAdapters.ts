import { createDepthFirstSearchTrace, createGraphTraversalTrace } from './api'
import type { AlgorithmAdapter } from './adapters'
import { graphPresets } from './graphPresets'
import type { GraphPreset } from './graphPresets'
import type { GraphPresentation } from './components/GraphVisualizer'
import type { DepthFirstSearchEvent, DepthFirstSearchState, DepthFirstSearchTrace, GraphAlgorithmEvent, GraphAlgorithmResult, GraphAlgorithmState, GraphAlgorithmTrace, GraphEdge, GraphTraversalEvent, GraphTraversalState, GraphTraversalTrace, NodeStatus } from './types'

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
  destination: 'NONE' | 'OPTIONAL'
  createTrace: (graph: { nodes: string[]; edges: GraphEdge[]; startNode: string; destination?: string }, signal?: AbortSignal) => Promise<GraphAlgorithmTrace>
  explain: (event: GraphAlgorithmEvent) => string
  complete: (result: GraphAlgorithmResult) => string
  completionAnnouncement: string
  metricsLabel: string
  metrics: (result: GraphAlgorithmResult) => { label: string; value: number }[]
  present: (nodes: string[], state?: GraphAlgorithmState, result?: GraphAlgorithmResult) => GraphPresentation
}

const BFS_LINES = [
  { id: 'bfs-initialize', text: 'mark start discovered; enqueue start' },
  { id: 'bfs-dequeue', text: 'dequeue node; mark active; visit node' },
  { id: 'bfs-examine-edge', text: 'examine the next neighbor in declaration order' },
  { id: 'bfs-enqueue-neighbor', text: 'mark neighbor discovered; record parent; enqueue' },
  { id: 'bfs-skip-neighbor', text: 'skip a neighbor that was already discovered' },
  { id: 'bfs-complete-node', text: 'mark node processed' },
  { id: 'bfs-complete-traversal', text: 'return traversal order' },
  { id: 'bfs-reconstruct-path', text: 'reconstruct the fewest-edge path from parents' },
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
    case 'PATH_RECONSTRUCTED':
      return event.data.pathFound
        ? `Fewest-edge path reconstructed: ${event.data.path.join(' → ')}.`
        : `No path reaches destination ${event.data.destination}.`
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
  destination: 'OPTIONAL',
  inputWarning: edges => edges.some(edge => edge.weight !== undefined)
    ? 'Breadth-first search ignores edge weights. Its search-tree routes minimize edge count, not total cost.'
    : undefined,
  createTrace: createGraphTraversalTrace,
  explain: event => explainGraphEvent(event as GraphTraversalEvent),
  complete: result => {
    const bfsResult = result as GraphTraversalTrace['result']
    if (bfsResult.pathFound === true) {
      const edges = bfsResult.pathEdgeCount === 1 ? 'edge' : 'edges'
      return `Fewest-edge path found: ${bfsResult.path?.join(' → ')} (${bfsResult.pathEdgeCount} ${edges}).`
    }
    if (bfsResult.pathFound === false) return 'No path reaches the selected destination.'
    return `Breadth-first traversal is complete. Unreachable nodes: ${result.unreachableNodes.join(', ') || 'none'}.`
  },
  completionAnnouncement: 'Traversal complete.',
  metricsLabel: 'Traversal metrics',
  metrics: result => [
    { label: 'visited', value: result.visitedNodeCount },
    { label: 'edges examined', value: result.edgeExaminationCount },
    { label: 'max queue', value: (result as GraphTraversalTrace['result']).maximumQueueSize },
  ],
  present(nodes, state, result) {
    const bfsState = state as GraphTraversalState | undefined
    const bfsResult = result as GraphTraversalTrace['result'] | undefined
    const nodeStates = nodes.map(node => `${node}: ${statusLabel[bfsState?.nodeStatuses[node] ?? 'UNREACHED']}`)
    const parents = nodes.flatMap(child => bfsState?.parents[child] ? [`${child} from ${bfsState.parents[child]}`] : [])
    const examinedEdge = bfsState?.examinedEdge ? `${bfsState.examinedEdge.from}–${bfsState.examinedEdge.to}` : 'none'
    const unreachable = bfsResult?.unreachableNodes
    const unexplored = bfsResult?.unexploredNodes
    const selectedPath = bfsState?.selectedPath ?? []
    const pathDescription = bfsResult?.pathFound === true
      ? ` Fewest-edge path: ${selectedPath.join(' → ')}.`
      : bfsResult?.pathFound === false ? ' Fewest-edge path: none.' : ''
    const completion = unreachable === undefined ? '' : ` Unreachable nodes: ${unreachable.join(', ') || 'none'}.`
    const unexploredDescription = unexplored === undefined ? '' : ` Unexplored nodes: ${unexplored.join(', ') || 'none'}.`
    const description = `${nodeStates.join(', ')}. Queue: ${bfsState?.queue.join(', ') || 'empty'}. Traversal order: ${bfsState?.traversalOrder.join(', ') || 'empty'}. Examined edge: ${examinedEdge}. Parents: ${parents.join(', ') || 'none'}.${pathDescription}${completion}${unexploredDescription}`
    const treeEdges = Object.entries(bfsState?.parents ?? {}).map(([child, parent]) => ({ from: child, to: parent }))
    const currentEdge = bfsState?.examinedEdge ?? null
    return {
      title: 'Breadth-first traversal graph',
      description,
      nodes: Object.fromEntries(nodes.map(node => {
        const status = bfsState?.nodeStatuses[node] ?? 'UNREACHED'
        return [node, { label: statusLabel[status], symbol: statusSymbol[status], style: status.toLowerCase() }]
      })),
      treeEdges,
      selectedPathEdges: selectedPath.slice(1).map((node, index) => ({ from: selectedPath[index], to: node })),
      examinedEdge: currentEdge,
      rows: [
        { label: 'Queue', value: bfsState?.queue.join(' → ') || 'Empty' },
        { label: 'Traversal order', value: bfsState?.traversalOrder.join(' → ') || 'Empty' },
        { label: 'Node states', value: nodeStates.join('; ') },
        { label: 'Parents', value: parents.join('; ') || 'None' },
        { label: 'Examined edge', value: examinedEdge === 'none' ? 'None' : examinedEdge },
        ...(bfsResult?.pathFound === undefined ? [] : [{ label: 'Fewest-edge path', value: selectedPath.join(' → ') || 'None' }]),
        ...(unreachable === undefined ? [] : [{ label: 'Unreachable nodes', value: unreachable.join(' → ') || 'None' }]),
        ...(unexplored === undefined ? [] : [{ label: 'Unexplored nodes', value: unexplored.join(' → ') || 'None' }]),
      ],
    }
  },
}

const DFS_LINES = [
  { id: 'dfs-initialize', text: 'mark start discovered; push start onto stack' },
  { id: 'dfs-pop', text: 'pop node from stack; mark active; visit node' },
  { id: 'dfs-examine-edge', text: 'examine the next neighbor' },
  { id: 'dfs-push-neighbor', text: 'mark neighbor discovered; record parent; push onto stack' },
  { id: 'dfs-skip-neighbor', text: 'skip a neighbor that was already discovered' },
  { id: 'dfs-complete-node', text: 'mark node processed' },
  { id: 'dfs-complete-traversal', text: 'return traversal order' },
]

function explainDepthFirstEvent(event: DepthFirstSearchEvent): string {
  switch (event.type) {
    case 'TRAVERSAL_INITIALIZED':
      return `Discover and push ${event.data.startNode} onto the stack.`
    case 'NODE_POPPED':
      return `Pop and visit ${event.data.node}.`
    case 'EDGE_EXAMINED':
      return `Examine edge ${event.data.from}–${event.data.to}.`
    case 'NODE_DISCOVERED':
      return `Discover ${event.data.node} from ${event.data.parent} and push it onto the stack.`
    case 'ALREADY_DISCOVERED_SKIPPED':
      return `Skip ${event.data.to}; it was already discovered.`
    case 'NODE_COMPLETED':
      return `Finish ${event.data.node}; all of its neighbors were examined.`
    case 'TRAVERSAL_COMPLETED':
      return `Traversal complete: ${event.data.traversalOrder.join(', ')}.`
  }
}

export const depthFirstAdapter: GraphAlgorithmAdapter = {
  id: 'dfs',
  family: 'GRAPH_TRAVERSAL',
  contractVersion: '2.0',
  title: 'Depth-First Search',
  intro: 'Watch iterative depth-first search discover, visit, and finish nodes using an explicit stack.',
  pseudocode: DFS_LINES,
  complexity: [
    { label: 'Time', value: 'O(V + E)', explanation: 'Each reachable node and edge is examined.' },
    { label: 'Space', value: 'O(V)', explanation: 'The stack and node state grow with the graph.' },
  ],
  presets: graphPresets,
  destination: 'NONE',
  inputWarning: edges => edges.some(edge => edge.weight !== undefined)
    ? 'Depth-first search ignores edge weights; they do not affect traversal order.'
    : undefined,
  createTrace: (request, signal) => createDepthFirstSearchTrace({
    nodes: request.nodes,
    edges: request.edges,
    startNode: request.startNode,
  }, signal),
  explain: event => explainDepthFirstEvent(event as DepthFirstSearchEvent),
  complete: result => `Depth-first traversal is complete. Unreachable nodes: ${result.unreachableNodes.join(', ') || 'none'}.`,
  completionAnnouncement: 'Depth-first traversal complete.',
  metricsLabel: 'Traversal metrics',
  metrics: result => [
    { label: 'visited', value: result.visitedNodeCount },
    { label: 'edges examined', value: result.edgeExaminationCount },
    { label: 'max stack', value: (result as DepthFirstSearchTrace['result']).maximumStackSize },
  ],
  present(nodes, state, result) {
    const dfsState = state as DepthFirstSearchState | undefined
    const nodeStates = nodes.map(node => `${node}: ${statusLabel[dfsState?.nodeStatuses[node] ?? 'UNREACHED']}`)
    const parents = nodes.flatMap(child => dfsState?.parents[child] ? [`${child} from ${dfsState.parents[child]}`] : [])
    const examinedEdge = dfsState?.examinedEdge ? `${dfsState.examinedEdge.from}–${dfsState.examinedEdge.to}` : 'none'
    const unreachableNodes = result?.unreachableNodes
    const completion = unreachableNodes === undefined ? '' : ` Unreachable nodes: ${unreachableNodes.join(', ') || 'none'}.`
    const description = `${nodeStates.join(', ')}. Stack (top first): ${dfsState?.stack.join(', ') || 'empty'}. Traversal order: ${dfsState?.traversalOrder.join(', ') || 'empty'}. Examined edge: ${examinedEdge}. Parents: ${parents.join(', ') || 'none'}.${completion}`
    return {
      title: 'Depth-first traversal graph',
      description,
      nodes: Object.fromEntries(nodes.map(node => {
        const status = dfsState?.nodeStatuses[node] ?? 'UNREACHED'
        return [node, { label: statusLabel[status], symbol: statusSymbol[status], style: status.toLowerCase() }]
      })),
      treeEdges: Object.entries(dfsState?.parents ?? {}).map(([child, parent]) => ({ from: child, to: parent })),
      selectedPathEdges: [],
      examinedEdge: dfsState?.examinedEdge ?? null,
      rows: [
        { label: 'Stack (top first)', value: dfsState?.stack.join(' → ') || 'Empty' },
        { label: 'Traversal order', value: dfsState?.traversalOrder.join(' → ') || 'Empty' },
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
  [depthFirstAdapter.id, depthFirstAdapter],
])
