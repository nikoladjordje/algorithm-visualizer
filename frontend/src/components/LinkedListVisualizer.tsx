import type { LinkedListNode, LinkedListState } from '../types'
import './StructureVisualizer.css'

export function LinkedListVisualizer({ state }: { state?: LinkedListState }) {
  const nodes = state?.nodes ?? []
  const nodeById = new Map(nodes.map(node => [node.occurrenceId, node]))
  const ordered: LinkedListNode[] = []
  let currentId = state?.headOccurrenceId ?? null
  while (currentId !== null) {
    const node = nodeById.get(currentId)
    if (!node) break
    ordered.push(node)
    currentId = node.nextOccurrenceId
  }
  const disconnected = nodes.filter(node => !ordered.some(orderedNode => orderedNode.occurrenceId === node.occurrenceId))
  const describe = (node: typeof nodes[number]) => `${node.value}, node ${node.occurrenceId}, next ${node.nextOccurrenceId === null ? 'null' : `node ${node.nextOccurrenceId}`}`
  const pendingDescription = state?.linkedOccurrenceId === null ? 'allocated but not yet linked' : 'linked to the current head but not yet head'
  const narration = `${ordered.length ? ordered.map(describe).join('; ') : 'empty, head null'}${disconnected.length ? `; ${pendingDescription}: ${disconnected.map(describe).join('; ')}` : ''}`
  return <div className="structure-visualizer linked-list-visualizer" role="img" aria-label={`Linked list: ${narration}.`}><strong>head → {state?.headOccurrenceId === null || !state ? 'null' : `node ${state.headOccurrenceId}`}</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p><ol>{ordered.map(node => <li key={node.occurrenceId}><span>{node.value} <small>node {node.occurrenceId}</small></span><span aria-hidden="true"> → next {node.nextOccurrenceId === null ? 'null' : `node ${node.nextOccurrenceId}`}</span></li>)}</ol>{disconnected.map(node => <p key={node.occurrenceId}>{pendingDescription === 'allocated but not yet linked' ? 'Allocated' : 'Linked'} node {node.occurrenceId}: {node.value}; next {node.nextOccurrenceId === null ? 'null' : `node ${node.nextOccurrenceId}`}</p>)}{!ordered.length && !disconnected.length && <span>Empty linked list</span>}</div>
}
