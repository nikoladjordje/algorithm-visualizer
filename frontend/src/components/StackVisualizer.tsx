import type { DataStructureState } from '../types'

export function StackVisualizer({ state }: { state?: DataStructureState }) {
  const values = state?.values ?? []
  return <div className="stack-visualizer" role="img" aria-label={`Stack, Top ${values.length ? values.at(-1) : 'empty'}`}><strong>Top</strong><p>Active operation: {state ? state.activeOperationIndex + 1 : 'none'}</p><ol>{[...values].reverse().map((value, index) => <li key={`${state?.occurrenceIds.at(-(index + 1))}`}>{value}{values.filter(item => item === value).length > 1 ? ` (${state?.occurrenceIds.at(-(index + 1))})` : ''}</li>)}</ol>{!values.length && <span>Empty stack</span>}</div>
}
