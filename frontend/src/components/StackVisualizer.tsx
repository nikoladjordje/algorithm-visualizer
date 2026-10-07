import type { DataStructureState } from '../types'
import { occurrenceDescriptions } from './structureOccurrences'
import './StackVisualizer.css'
import './StructureVisualizer.css'

export function StackVisualizer({ state }: { state?: DataStructureState }) {
  const values = state?.values ?? []
  const descriptions = occurrenceDescriptions(values, state?.occurrenceIds ?? [])
  const topDescription = values.length ? `${values.at(-1)}${descriptions.at(-1) ? ` occurrence ${descriptions.at(-1)}` : ''}` : 'empty'
  const valueDescription = [...values].reverse().map((value, index) => `${value}${descriptions[values.length - index - 1] ? ` occurrence ${descriptions[values.length - index - 1]}` : ''}`).join(', ')
  return <div className="stack-visualizer" role="img" aria-label={`Stack, Top ${topDescription}. Values from top: ${valueDescription || 'empty'}.`}><strong>Top</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p><ol>{[...values].reverse().map((value, index) => { const valueIndex = values.length - index - 1, occurrence = descriptions[valueIndex]; return <li key={`${state?.occurrenceIds[valueIndex]}`}><span>{value}</span>{occurrence && <span className="occurrence-badge">Occurrence {occurrence}</span>}</li> })}</ol>{!values.length && <span>Empty stack</span>}</div>
}
