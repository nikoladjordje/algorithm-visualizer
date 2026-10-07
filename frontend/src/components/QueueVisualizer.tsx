import type { DataStructureState } from '../types'
import './QueueVisualizer.css'

export function QueueVisualizer({ state }: { state?: DataStructureState }) {
  const values = state?.values ?? []
  return <div className="queue-visualizer" role="img" aria-label={`Queue, Front ${values.length ? values[0] : 'empty'}, rear ${values.length ? values.at(-1) : 'empty'}`}><div><strong>Front</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p></div><ol>{values.map((value, index) => <li key={state?.occurrenceIds[index]}>{value}{values.filter(item => item === value).length > 1 ? ` (${state?.occurrenceIds[index]})` : ''}</li>)}</ol><strong>Rear</strong>{!values.length && <span>Empty queue</span>}</div>
}
