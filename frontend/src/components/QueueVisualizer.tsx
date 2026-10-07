import type { DataStructureState } from '../types'
import './QueueVisualizer.css'
import './StructureVisualizer.css'
import { occurrenceDescriptions } from './structureOccurrences'

export function QueueVisualizer({ state }: { state?: DataStructureState }) {
  const values = state?.values ?? []
  const descriptions = occurrenceDescriptions(values, state?.occurrenceIds ?? [])
  const describeEnd = (index: number) => `${values[index]}${descriptions[index] ? ` occurrence ${descriptions[index]}` : ''}`
  const valueDescription = values.map((value, index) => `${value}${descriptions[index] ? ` occurrence ${descriptions[index]}` : ''}`).join(', ')
  return <div className="queue-visualizer" role="img" aria-label={`Queue, Front ${values.length ? describeEnd(0) : 'empty'}, rear ${values.length ? describeEnd(values.length - 1) : 'empty'}. Values from front: ${valueDescription || 'empty'}.`}><div><strong>Front</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p></div><ol>{values.map((value, index) => <li key={state?.occurrenceIds[index]}><span>{value}</span>{descriptions[index] && <span className="occurrence-badge">Occurrence {descriptions[index]}</span>}</li>)}</ol><strong>Rear</strong>{!values.length && <span>Empty queue</span>}</div>
}
