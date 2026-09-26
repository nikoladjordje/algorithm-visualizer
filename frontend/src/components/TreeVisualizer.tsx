import type { TreeOperation, TreeState } from '../types'

export function TreeVisualizer({ state, operation, completed = false }: { state?: TreeState; operation?: TreeOperation['kind']; completed?: boolean }) {
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
  const playbackState = (node: TreeState['nodes'][number]) => {
    const active = node.id === state?.activeNodeId
    const visited = state?.traversalOrder.includes(node.value) || state?.lookupPath?.includes(node.value)
    const direction = active ? state?.comparisonDirection : null
    const attached = node.id === state?.attachedNodeId
    return { active, visited, direction, attached, labels: [active && 'active', visited && 'visited', direction && `comparison moves ${direction}`, attached && 'attached', completed && 'complete'].filter(Boolean) }
  }
  const stateDescription = `${nodes.map(node => {
    const labels = playbackState(node).labels.filter(label => label !== 'complete')
    return labels.length ? `${node.value}: ${labels.join(', ')}.` : ''
  }).filter(Boolean).join(' ')}${completed ? ' Tree operation complete.' : ''}`.trim()
  return <div className="tree-visualizer"><svg role="img" aria-label="Binary search tree" aria-describedby="tree-description tree-state-description" viewBox={`0 0 600 ${height}`}>
    {nodes.flatMap(node => [node.leftId, node.rightId].filter((id): id is number => id !== null).map(childId => {
      const from = positions.get(node.id), to = positions.get(childId)
      return from && to ? <line key={`${node.id}-${childId}`} className="tree-edge" x1={from.x} y1={from.y} x2={to.x} y2={to.y} /> : null
    }))}
    {nodes.map(node => {
      const position = positions.get(node.id)
      if (!position) return null
      const { active, visited, direction, attached, labels } = playbackState(node)
      return <g key={node.id} transform={`translate(${position.x} ${position.y})`} aria-label={`${node.value}${labels.length ? `, ${labels.join(', ')}` : ''}`}>
        <circle className={`tree-node${active ? ' tree-node--active' : ''}${visited ? ' tree-node--visited' : ''}${direction ? ` tree-node--direction-${direction}` : ''}${attached ? ' tree-node--attached' : ''}${completed ? ' tree-node--complete' : ''}`} r="24" />
        <text textAnchor="middle" dy=".35em" aria-hidden="true">{node.value}</text>
        {direction && <text className="tree-node-marker tree-node-marker--direction" x={direction === 'left' ? -34 : 34} textAnchor="middle" aria-hidden="true">{direction === 'left' ? '←' : '→'}</text>}
        {attached && <text className="tree-node-marker tree-node-marker--attached" x="20" y="-18" textAnchor="middle" aria-hidden="true">+</text>}
        {completed && <text className="tree-node-marker tree-node-marker--complete" x="20" y="22" textAnchor="middle" aria-hidden="true">✓</text>}
      </g>
    })}
  </svg><p id="tree-description" className="tree-description">{description}</p><p id="tree-state-description" className="sr-only">{stateDescription || 'No highlighted tree state.'}</p>{state?.comparisonDirection && <p>Comparison moves {state.comparisonDirection}.</p>}{completed && <p>Tree operation complete.</p>}<p>{state?.lookupTarget === null || state?.lookupTarget === undefined ? `${operation === 'INORDER' ? 'Inorder' : operation === 'POSTORDER' ? 'Postorder' : 'Preorder'}: ${state?.traversalOrder.join(' → ') || 'not started'}` : `Lookup path: ${state.lookupPath?.join(' → ') || 'not started'}`}</p></div>
}
