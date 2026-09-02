import type { GraphTraversalState, NodeStatus } from '../types'

interface Props {
  node: string
  state?: GraphTraversalState
}

const statusLabel: Record<NodeStatus, string> = {
  UNREACHED: 'unreached', DISCOVERED: 'discovered', ACTIVE: 'active', PROCESSED: 'processed',
}

export function GraphVisualizer({ node, state }: Props) {
  const status = state?.nodeStatuses[node] ?? 'UNREACHED'
  const description = `${node} is ${statusLabel[status]}. Queue: ${state?.queue.join(', ') || 'empty'}. Traversal order: ${state?.traversalOrder.join(', ') || 'empty'}.`
  return <div className="graph-visualizer">
    <svg role="img" aria-label={`Breadth-first traversal graph: ${description}`} viewBox="0 0 420 260">
      <title>Breadth-first traversal graph</title>
      <desc>{description}</desc>
      <circle className={`graph-node graph-node--${status.toLowerCase()}`} cx="210" cy="125" r="48" />
      <text x="210" y="132" textAnchor="middle">{node}</text>
      <text className="graph-status" x="210" y="198" textAnchor="middle">{statusLabel[status]}</text>
    </svg>
    <dl className="graph-state" aria-label="Graph state">
      <div><dt>Queue</dt><dd>{state?.queue.join(' → ') || 'Empty'}</dd></div>
      <div><dt>Traversal order</dt><dd>{state?.traversalOrder.join(' → ') || 'Empty'}</dd></div>
      <div><dt>Node state</dt><dd>{node}: {statusLabel[status]}</dd></div>
    </dl>
  </div>
}
