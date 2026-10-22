import type { DoublyLinkedListNode, DoublyLinkedListState } from '../types'
import './StructureVisualizer.css'

export function DoublyLinkedListVisualizer({ state, deque = false }: { state?: DoublyLinkedListState; deque?: boolean }) {
  const nodes = state?.nodes ?? []
  const byId = new Map(nodes.map(node => [node.occurrenceId, node]))
  const ordered: DoublyLinkedListNode[] = []
  let id = state?.headOccurrenceId ?? null
  while (id !== null) { const node = byId.get(id); if (!node) break; ordered.push(node); id = node.nextOccurrenceId }
  const disconnected = nodes.filter(node => !ordered.some(item => item.occurrenceId === node.occurrenceId))
  const describe = (node: DoublyLinkedListNode) => `${node.value}, node ${node.occurrenceId}, prev ${node.prevOccurrenceId === null ? 'null' : `node ${node.prevOccurrenceId}`}, next ${node.nextOccurrenceId === null ? 'null' : `node ${node.nextOccurrenceId}`}`
  const topology = ordered.length ? ordered.map(describe).join('; ') : 'empty'
  const front = deque ? 'front' : 'head', rear = deque ? 'rear' : 'tail'
  const pending = disconnected.length ? ` Nodes outside the ${front} chain: ${disconnected.map(describe).join('; ')}.` : ''
  const active = state ? ` Active operation ${state.activeOperationIndex + 1}.${state.allocatedOccurrenceId === null ? '' : ` Allocated node ${state.allocatedOccurrenceId}.`}${state.linkedOccurrenceId === null ? '' : ` Active node ${state.linkedOccurrenceId}.`}` : ''
  return <div className="structure-visualizer linked-list-visualizer" role="img" aria-label={`${deque ? 'Deque' : 'Doubly linked list'}: ${front} ${state?.headOccurrenceId === null || !state ? 'null' : `node ${state.headOccurrenceId}`}; ${rear} ${state?.tailOccurrenceId === null || !state ? 'null' : `node ${state.tailOccurrenceId}`}; ${topology}.${pending}${active}`}>
    <strong>{front} → {state?.headOccurrenceId === null || !state ? 'null' : `node ${state.headOccurrenceId}`}</strong><strong>{rear} → {state?.tailOccurrenceId === null || !state ? 'null' : `node ${state.tailOccurrenceId}`}</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p>
    <ol>{ordered.map(node => <li key={node.occurrenceId}><span>{node.value} <small>node {node.occurrenceId}</small></span><span> ← prev {node.prevOccurrenceId === null ? 'null' : `node ${node.prevOccurrenceId}`} | next {node.nextOccurrenceId === null ? 'null' : `node ${node.nextOccurrenceId}`} →</span></li>)}</ol>
    {disconnected.map(node => <p key={node.occurrenceId}>Node outside the {front} chain {node.occurrenceId}: {describe(node)}</p>)}{!nodes.length && <span>Empty {deque ? 'deque' : 'doubly linked list'}</span>}
  </div>
}
