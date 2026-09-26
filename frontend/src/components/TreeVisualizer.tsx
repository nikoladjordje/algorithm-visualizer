import type { TreeState } from '../types'

export function TreeVisualizer({ state }: { state?: TreeState }) {
  const nodes = state?.nodes ?? []
  const root = nodes.find(node => node.id === state?.rootId)
  const description = root
    ? `Root ${root.value}. ${nodes.map(node => `${node.value}: left ${nodes.find(child => child.id === node.leftId)?.value ?? 'none'}, right ${nodes.find(child => child.id === node.rightId)?.value ?? 'none'}`).join('. ')}.`
    : 'The binary search tree is empty.'
  const positions = new Map<number, { x: number; y: number }>()
  const place = (nodeId: number | null, depth: number, left: number, right: number) => {
    if (nodeId === null) return
    const node = nodes.find(item => item.id === nodeId)
    if (!node) return
    const x = (left + right) / 2
    positions.set(node.id, { x, y: 52 + depth * 78 })
    place(node.leftId, depth + 1, left, x)
    place(node.rightId, depth + 1, x, right)
  }
  place(state?.rootId ?? null, 0, 40, 560)
  const height = Math.max(160, 104 + Math.max(0, ...[...positions.values()].map(position => position.y)) + 42)
  return <div className="tree-visualizer"><svg role="img" aria-label="Binary search tree" viewBox={`0 0 600 ${height}`}>
    {nodes.flatMap(node => [node.leftId, node.rightId].filter((id): id is number => id !== null).map(childId => {
      const from = positions.get(node.id), to = positions.get(childId)
      return from && to ? <line key={`${node.id}-${childId}`} className="tree-edge" x1={from.x} y1={from.y} x2={to.x} y2={to.y} /> : null
    }))}
    {nodes.map(node => { const position = positions.get(node.id); if (!position) return null; const active = node.id === state?.activeNodeId; const visited = state?.traversalOrder.includes(node.value) || state?.lookupPath?.includes(node.value); return <g key={node.id} transform={`translate(${position.x} ${position.y})`}><circle className={`tree-node${active ? ' tree-node--active' : ''}${visited ? ' tree-node--visited' : ''}`} r="24" /><text textAnchor="middle" dy=".35em">{node.value}</text><title>{node.value}{active ? ', active' : visited ? ', visited' : ''}</title></g> })}
  </svg><p className="tree-description">{description}</p><p>{state?.lookupTarget === null || state?.lookupTarget === undefined ? `Preorder: ${state?.traversalOrder.join(' → ') || 'not started'}` : `Lookup path: ${state.lookupPath?.join(' → ') || 'not started'}`}</p></div>
}
