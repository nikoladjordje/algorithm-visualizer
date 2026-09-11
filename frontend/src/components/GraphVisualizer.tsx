import { useMemo } from 'react'
import { graphLayout } from './graphLayout'
import type { GraphEdge } from '../types'

export interface GraphPresentation {
  title: string
  description: string
  statusKey: { label: string; symbol: string; style: string }[]
  selectedPathLabel?: string
  nodes: Record<string, { label: string; symbol: string; style: string }>
  treeEdges: GraphEdge[]
  selectedPathEdges: GraphEdge[]
  examinedEdge: GraphEdge | null
  rows: { label: string; value: string }[]
}

interface Props {
  nodes: string[]
  edges: GraphEdge[]
  presentation: GraphPresentation
}

const edgeKey = (from: string, to: string) => [from, to].sort().join('\0')

export function GraphVisualizer({ nodes, edges, presentation }: Props) {
  const { title, description } = presentation
  const treeEdges = new Set(presentation.treeEdges.map(edge => edgeKey(edge.from, edge.to)))
  const selectedPathEdges = new Set(presentation.selectedPathEdges.map(edge => edgeKey(edge.from, edge.to)))
  const currentEdge = presentation.examinedEdge ? edgeKey(presentation.examinedEdge.from, presentation.examinedEdge.to) : null
  const { positions, labels, width, height, weighted } = useMemo(() => graphLayout(nodes, edges), [nodes, edges])
  const edgeDescription = weighted ? ` Edges: ${edges.map(edge => `${edge.from}–${edge.to}: ${edge.weight === undefined ? 'unweighted' : `weight ${edge.weight}`}`).join('; ')}.` : ''
  return <div className="graph-visualizer">
    <div className={weighted ? 'graph-scroll' : undefined} role={weighted ? 'region' : undefined}
      aria-label={weighted ? 'Weighted graph, scroll to explore' : undefined} tabIndex={weighted ? 0 : undefined}>
    <svg role="img" aria-label={`${title}. ${description}${edgeDescription}`} viewBox={`0 0 ${width} ${height}`}
      style={weighted ? { width, height } : undefined}>
      <title>{title}</title>
      <desc>{description}{edgeDescription}</desc>
      {edges.map(({ from, to }) => { const key=edgeKey(from,to); const kind=selectedPathEdges.has(key)?'selected-path':currentEdge===key?'examined':treeEdges.has(key)?'tree':'base'; return <line key={`${from}-${to}`} className={`graph-edge graph-edge--${kind}`}
        x1={positions[from].x} y1={positions[from].y} x2={positions[to].x} y2={positions[to].y}
        stroke="currentColor" aria-hidden="true" vectorEffect="non-scaling-stroke" />})}
      {labels.map(({ edge, x, y, anchor }) => <path key={`${edge.from}-${edge.to}`}
        d={`M ${anchor.x} ${anchor.y} L ${x} ${y}`} className="graph-weight-connector" aria-hidden="true" />)}
      {labels.map(({ edge, x, y }) => <g key={`${edge.from}-${edge.to}`} className="graph-weight"
        role="group" aria-label={`${edge.from}–${edge.to}, weight ${edge.weight}`}>
        <rect x={x - 14} y={y - 10} width="28" height="20" rx="4" />
        <text x={x} y={y + 4} textAnchor="middle">{edge.weight}</text>
      </g>)}
      {nodes.map(node => {
        const { x, y } = positions[node]
        const status = presentation.nodes[node]
        return <g key={node} role="group" aria-label={`${node}, ${status.label}`}>
          <circle className={`graph-node graph-node--${status.style}`} cx={x} cy={y} r="26" />
          <text className="graph-node-label" x={x} y={y + 5} textAnchor="middle">{node}</text>
          <text className="graph-status-symbol" aria-hidden="true" x={x + 22} y={y - 19} textAnchor="middle">{status.symbol}</text>
          <text className="graph-status" x={x} y={y + 43} textAnchor="middle">{status.label}</text>
        </g>
      })}
    </svg>
    </div>
    <ul className="graph-key" aria-label="Graph visual key">
      {presentation.statusKey.map(status => <li key={status.label}>
        <span className={`graph-key-node graph-node--${status.style}`} aria-hidden="true">{status.symbol}</span>{status.label}
      </li>)}
      <li><span className="graph-key-edge graph-key-edge--tree" aria-hidden="true"/>Search tree</li>
      <li><span className="graph-key-edge graph-key-edge--examined" aria-hidden="true"/>Examined edge</li>
      {presentation.selectedPathLabel && <li><span className="graph-key-edge graph-key-edge--selected-path" aria-hidden="true"/>{presentation.selectedPathLabel}</li>}
    </ul>
    <dl className="graph-state" aria-label="Graph state">
      {presentation.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
      {weighted && <div><dt>Edge weights</dt><dd>{edges.map(edge => `${edge.from}–${edge.to}: ${edge.weight ?? 'unweighted'}`).join('; ')}</dd></div>}
    </dl>
  </div>
}
