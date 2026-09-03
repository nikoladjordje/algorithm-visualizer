import type { GraphEdge, GraphTraversalState, NodeStatus } from '../types'

interface Props {
  nodes: string[]
  edges: GraphEdge[]
  state?: GraphTraversalState
  unreachableNodes?: string[]
}

const statusLabel: Record<NodeStatus, string> = {
  UNREACHED: 'unreached', DISCOVERED: 'discovered', ACTIVE: 'active', PROCESSED: 'processed',
}
const statusSymbol: Record<NodeStatus, string> = {
  UNREACHED: '○', DISCOVERED: '+', ACTIVE: '▶', PROCESSED: '✓',
}
const edgeKey = (from: string, to: string) => [from, to].sort().join('\0')

export function GraphVisualizer({ nodes, edges, state, unreachableNodes }: Props) {
  const nodeStates = nodes.map(node => `${node}: ${statusLabel[state?.nodeStatuses[node] ?? 'UNREACHED']}`)
  const parents = nodes.flatMap(child => state?.parents[child] ? [`${child} from ${state.parents[child]}`] : [])
  const examinedEdge = state?.examinedEdge ? `${state.examinedEdge.from}–${state.examinedEdge.to}` : 'none'
  const completion = unreachableNodes === undefined ? '' : ` Unreachable nodes: ${unreachableNodes.join(', ') || 'none'}.`
  const description = `${nodeStates.join(', ')}. Queue: ${state?.queue.join(', ') || 'empty'}. Traversal order: ${state?.traversalOrder.join(', ') || 'empty'}. Examined edge: ${examinedEdge}. Parents: ${parents.join(', ') || 'none'}.${completion}`
  const treeEdges = new Set(Object.entries(state?.parents ?? {}).map(([child, parent]) => edgeKey(child, parent)))
  const currentEdge = state?.examinedEdge ? edgeKey(state.examinedEdge.from, state.examinedEdge.to) : null
  const positions = Object.fromEntries(nodes.map((node, index) => {
    if (nodes.length === 1) return [node, { x: 260, y: 175 }]
    const angle = -Math.PI / 2 + 2 * Math.PI * index / nodes.length
    return [node, { x: 260 + 190 * Math.cos(angle), y: 175 + 125 * Math.sin(angle) }]
  }))
  return <div className="graph-visualizer">
    <svg role="img" aria-label={`Breadth-first traversal graph. ${description}`} viewBox="0 0 520 360">
      <title>Breadth-first traversal graph</title>
      <desc>{description}</desc>
      {edges.map(({ from, to }) => { const key=edgeKey(from,to); const kind=currentEdge===key?'examined':treeEdges.has(key)?'tree':'base'; return <line key={`${from}-${to}`} className={`graph-edge graph-edge--${kind}`}
        x1={positions[from].x} y1={positions[from].y} x2={positions[to].x} y2={positions[to].y}
        stroke="currentColor" aria-hidden="true" vectorEffect="non-scaling-stroke" />})}
      {nodes.map(node => {
        const { x, y } = positions[node]
        const status = state?.nodeStatuses[node] ?? 'UNREACHED'
        return <g key={node} role="group" aria-label={`${node}, ${statusLabel[status]}`}>
          <circle className={`graph-node graph-node--${status.toLowerCase()}`} cx={x} cy={y} r="26" />
          <text className="graph-node-label" x={x} y={y + 5} textAnchor="middle">{node}</text>
          <text className="graph-status-symbol" aria-hidden="true" x={x + 22} y={y - 19} textAnchor="middle">{statusSymbol[status]}</text>
          <text className="graph-status" x={x} y={y + 43} textAnchor="middle">{statusLabel[status]}</text>
        </g>
      })}
    </svg>
    <dl className="graph-state" aria-label="Graph state">
      <div><dt>Queue</dt><dd>{state?.queue.join(' → ') || 'Empty'}</dd></div>
      <div><dt>Traversal order</dt><dd>{state?.traversalOrder.join(' → ') || 'Empty'}</dd></div>
      <div><dt>Node states</dt><dd>{nodeStates.join('; ')}</dd></div>
      <div><dt>Parents</dt><dd>{parents.join('; ') || 'None'}</dd></div>
      <div><dt>Examined edge</dt><dd>{examinedEdge === 'none' ? 'None' : examinedEdge}</dd></div>
      {unreachableNodes!==undefined&&<div><dt>Unreachable nodes</dt><dd>{unreachableNodes.join(' → ')||'None'}</dd></div>}
    </dl>
  </div>
}
