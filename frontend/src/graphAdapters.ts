import { createDepthFirstSearchTrace, createDijkstraTrace, createGraphTraversalTrace } from './api'
import type { AlgorithmAdapter } from './adapters'
import { graphPresets } from './graphPresets'
import type { GraphPreset } from './graphPresets'
import type { GraphPresentation } from './components/GraphVisualizer'
import type { DepthFirstSearchEvent, DepthFirstSearchState, DepthFirstSearchTrace, GraphAlgorithmEvent, GraphAlgorithmResult, GraphAlgorithmState, GraphAlgorithmTrace, GraphEdge, GraphTraversalEvent, GraphTraversalState, GraphTraversalTrace, NodeStatus, PathfindingEvent, PathfindingNodeStatus, PathfindingState, PathfindingTrace } from './types'

export interface GraphAlgorithmAdapter {
  id: string
  family: 'GRAPH_TRAVERSAL' | 'PATHFINDING'
  contractVersion: '2.0'
  title: string
  intro: string
  warning?: string
  inputWarning: (edges: readonly GraphEdge[]) => string | undefined
  pseudocode: AlgorithmAdapter['pseudocode']
  complexity: AlgorithmAdapter['complexity']
  presets: readonly GraphPreset[]
  destination: 'NONE' | 'OPTIONAL' | 'REQUIRED'
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
    return `Breadth-first traversal is complete. Unreachable nodes: ${bfsResult.unreachableNodes.join(', ') || 'none'}.`
  },
  completionAnnouncement: 'Traversal complete.',
  metricsLabel: 'Traversal metrics',
  metrics: result => {
    const bfsResult = result as GraphTraversalTrace['result']
    return [
      { label: 'visited', value: bfsResult.visitedNodeCount },
      { label: 'edges examined', value: bfsResult.edgeExaminationCount },
      { label: 'max queue', value: bfsResult.maximumQueueSize },
    ]
  },
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
  complete: result => {
    const dfsResult = result as DepthFirstSearchTrace['result']
    return `Depth-first traversal is complete. Unreachable nodes: ${dfsResult.unreachableNodes.join(', ') || 'none'}.`
  },
  completionAnnouncement: 'Depth-first traversal complete.',
  metricsLabel: 'Traversal metrics',
  metrics: result => {
    const dfsResult = result as DepthFirstSearchTrace['result']
    return [
      { label: 'visited', value: dfsResult.visitedNodeCount },
      { label: 'edges examined', value: dfsResult.edgeExaminationCount },
      { label: 'max stack', value: dfsResult.maximumStackSize },
    ]
  },
  present(nodes, state, result) {
    const dfsState = state as DepthFirstSearchState | undefined
    const dfsResult = result as DepthFirstSearchTrace['result'] | undefined
    const nodeStates = nodes.map(node => `${node}: ${statusLabel[dfsState?.nodeStatuses[node] ?? 'UNREACHED']}`)
    const parents = nodes.flatMap(child => dfsState?.parents[child] ? [`${child} from ${dfsState.parents[child]}`] : [])
    const examinedEdge = dfsState?.examinedEdge ? `${dfsState.examinedEdge.from}–${dfsState.examinedEdge.to}` : 'none'
    const unreachableNodes = dfsResult?.unreachableNodes
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

const DIJKSTRA_LINES = [
  { id: 'dijkstra-initialize', text: 'set start distance to 0; add start to priority frontier' },
  { id: 'dijkstra-skip-stale', text: 'discard a stale priority entry' },
  { id: 'dijkstra-select-node', text: 'remove the smallest-distance node from the priority frontier' },
  { id: 'dijkstra-settle-node', text: 'settle the selected node at its minimum distance' },
  { id: 'dijkstra-examine-edge', text: 'calculate a candidate cost through the selected node' },
  { id: 'dijkstra-update-distance', text: 'record a better distance and parent; update the frontier' },
  { id: 'dijkstra-reject-relaxation', text: 'reject a candidate that does not improve the known distance' },
  { id: 'dijkstra-reconstruct-path', text: 'reconstruct the minimum-cost path from parents' },
]

function explainPathfindingEvent(event: PathfindingEvent): string {
  switch (event.type) {
    case 'PATHFINDING_INITIALIZED':
      return `Set ${event.data.startNode}'s distance to 0 and search for ${event.data.destination}.`
    case 'STALE_FRONTIER_ENTRY_SKIPPED':
      return `Discard stale ${event.data.node} at cost ${event.data.queuedDistance}; its current distance is ${event.data.currentDistance}.`
    case 'NODE_SELECTED':
      return `Remove ${event.data.node}, the smallest frontier distance at ${event.data.distance}.`
    case 'NODE_SETTLED':
      return `Settle ${event.data.node}; its minimum cost is ${event.data.distance}.`
    case 'EDGE_EXAMINED':
      return `Examine ${event.data.from}–${event.data.to} (cost ${event.data.weight}): candidate ${event.data.candidateCost}, known ${event.data.currentKnownCost ?? '∞'}.`
    case 'DISTANCE_UPDATED':
      return `Update ${event.data.node} from ${event.data.previousDistance ?? '∞'} to ${event.data.newDistance} through ${event.data.parent}.`
    case 'RELAXATION_REJECTED':
      return `Reject cost ${event.data.candidateCost} for ${event.data.to}; known cost ${event.data.currentKnownCost ?? '∞'} is no worse.`
    case 'PATH_RECONSTRUCTED':
      return event.data.pathFound
        ? `Minimum-cost path reconstructed: ${event.data.path.join(' → ')} at total cost ${event.data.totalCost}.`
        : `No path reaches destination ${event.data.destination}.`
  }
}

const pathStatusLabel: Record<PathfindingNodeStatus, string> = {
  UNREACHED: 'unreached', FRONTIER: 'frontier', ACTIVE: 'active', SETTLED: 'settled',
}
const pathStatusSymbol: Record<PathfindingNodeStatus, string> = {
  UNREACHED: '○', FRONTIER: '+', ACTIVE: '▶', SETTLED: '✓',
}

export const dijkstraAdapter: GraphAlgorithmAdapter = {
  id: 'dijkstra',
  family: 'PATHFINDING',
  contractVersion: '2.0',
  title: "Dijkstra's Algorithm",
  intro: 'Watch Dijkstra settle the lowest-cost frontier and build a minimum-cost route.',
  pseudocode: DIJKSTRA_LINES,
  complexity: [
    { label: 'Time', value: 'O((V + E) log V)', explanation: 'Priority-frontier operations add a logarithmic factor.' },
    { label: 'Space', value: 'O(V + E)', explanation: 'Distances, parents, adjacency, and frontier entries scale with the graph.' },
  ],
  presets: graphPresets,
  destination: 'REQUIRED',
  inputWarning: edges => edges.some(edge => edge.weight === undefined)
    ? 'Dijkstra treats every unweighted edge as cost 1.'
    : undefined,
  createTrace: (request, signal) => createDijkstraTrace({
    nodes: request.nodes,
    edges: request.edges,
    startNode: request.startNode,
    destination: request.destination!,
  }, signal),
  explain: event => explainPathfindingEvent(event as PathfindingEvent),
  complete: result => {
    const pathResult = result as PathfindingTrace['result']
    return pathResult.pathFound
      ? `Minimum-cost path found: ${pathResult.path.join(' → ')} (total cost ${pathResult.totalCost}).`
      : 'No path reaches the selected destination.'
  },
  completionAnnouncement: 'Dijkstra pathfinding complete.',
  metricsLabel: 'Pathfinding metrics',
  metrics: result => {
    const pathResult = result as PathfindingTrace['result']
    return [
      { label: 'settled', value: pathResult.settledNodeCount },
      { label: 'relaxations', value: pathResult.relaxationAttemptCount },
      { label: 'updates', value: pathResult.successfulUpdateCount },
      { label: 'rejected', value: pathResult.rejectedUpdateCount },
      { label: 'max frontier', value: pathResult.maximumFrontierSize },
    ]
  },
  present(nodes, state, result) {
    const pathState = state as PathfindingState | undefined
    const pathResult = result as PathfindingTrace['result'] | undefined
    const nodeStates = nodes.map(node => `${node}: ${pathStatusLabel[pathState?.nodeStatuses[node] ?? 'UNREACHED']}`)
    const distances = nodes.map(node => `${node}: ${pathState?.tentativeDistances[node] ?? '∞'}`)
    const parents = nodes.flatMap(child => pathState?.parents[child] ? [`${child} from ${pathState.parents[child]}`] : [])
    const frontier = pathState?.frontier.map(entry => `${entry.node} (${entry.distance})`) ?? []
    const examinedEdge = pathState?.examinedEdge ? `${pathState.examinedEdge.from}–${pathState.examinedEdge.to}` : 'none'
    const selectedPath = pathState?.selectedPath ?? []
    const pathDescription = pathResult === undefined ? '' : pathResult.pathFound
      ? ` Minimum-cost path: ${selectedPath.join(' → ')}; total cost ${pathResult.totalCost}.`
      : ' Minimum-cost path: none.'
    const description = `${nodeStates.join(', ')}. Priority frontier: ${frontier.join(', ') || 'empty'}. Tentative distances: ${distances.join(', ')}. Examined edge: ${examinedEdge}. Parents: ${parents.join(', ') || 'none'}.${pathDescription}`
    return {
      title: 'Dijkstra pathfinding graph',
      description,
      nodes: Object.fromEntries(nodes.map(node => {
        const status = pathState?.nodeStatuses[node] ?? 'UNREACHED'
        const style = status === 'FRONTIER' ? 'discovered' : status === 'SETTLED' ? 'processed' : status.toLowerCase()
        return [node, { label: pathStatusLabel[status], symbol: pathStatusSymbol[status], style }]
      })),
      treeEdges: Object.entries(pathState?.parents ?? {}).map(([child, parent]) => ({ from: child, to: parent })),
      selectedPathEdges: selectedPath.slice(1).map((node, index) => ({ from: selectedPath[index], to: node })),
      examinedEdge: pathState?.examinedEdge ?? null,
      rows: [
        { label: 'Priority frontier', value: frontier.join(' → ') || 'Empty' },
        { label: 'Tentative distances', value: distances.join('; ') },
        { label: 'Node states', value: nodeStates.join('; ') },
        { label: 'Parents', value: parents.join('; ') || 'None' },
        { label: 'Examined edge', value: examinedEdge === 'none' ? 'None' : examinedEdge },
        ...(pathResult === undefined ? [] : [{ label: 'Minimum-cost path', value: selectedPath.join(' → ') || 'None' }]),
        ...(pathResult?.totalCost === undefined ? [] : [{ label: 'Total cost', value: String(pathResult.totalCost) }]),
      ],
    }
  },
}

export const graphAdapters: ReadonlyMap<string, GraphAlgorithmAdapter> = new Map([
  [breadthFirstAdapter.id, breadthFirstAdapter],
  [depthFirstAdapter.id, depthFirstAdapter],
  [dijkstraAdapter.id, dijkstraAdapter],
])
