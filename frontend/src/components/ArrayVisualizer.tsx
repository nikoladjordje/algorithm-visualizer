import type { AlgorithmEventType, SortedRange, TraceItem } from '../types'

interface ArrayVisualizerProps {
  values?: number[]
  items?: TraceItem[]
  activeIndices: number[]
  eventType?: AlgorithmEventType
  complete: boolean
  sortedThrough?: number
  sortedRanges?: SortedRange[]
  annotations?: string[]
  buffer?: TraceItem[]
}

export function ArrayVisualizer({ values: legacyValues, items, activeIndices, eventType, complete, sortedThrough = -1, sortedRanges = [], annotations = [], buffer = [] }: ArrayVisualizerProps) {
  const visibleItems = items ?? (legacyValues ?? []).map((value,id)=>({id,value}))
  const values = visibleItems.map(item=>item.value)
  const maximum = Math.max(...values.map((value) => Math.abs(value)), 1)
  const stateDescription = complete
    ? 'Sorting complete.'
    : eventType
      ? `${eventLabel(eventType)} indices ${activeIndices.join(' and ')}.`
      : 'Initial array.'

  return (
    <div
      className="chart"
      role="img"
      aria-label={`${stateDescription} Array values by index: ${values.map((value, index) => `${index}: ${value}`).join(', ')}`}
    >
      {values.map((value, index) => {
        const active = activeIndices.includes(index) && eventType !== 'MARK_SORTED'
        const state = active
          ? eventType?.toLowerCase() ?? 'unsorted'
          : complete || index <= sortedThrough || sortedRanges.some(range=>index>=range.fromIndex&&index<=range.throughIndex)
            ? 'sorted'
            : 'unsorted'
        return (
          <div className="bar-slot" key={visibleItems[index].id} aria-hidden="true">
            <span className="bar-value">{value}</span>
            <div
              className={`bar bar--${state}`}
              style={{ height: `${Math.max(12, (Math.abs(value) / maximum) * 100)}%` }}
              title={`Index ${index}: ${value}`}
            />
            <span className="bar-index">{index}</span>
            <span className="item-id">#{visibleItems[index].id}</span>
          </div>
        )
      })}
      {annotations.length > 0 && <span className="chart-annotations">{annotations.join(' · ')}</span>}
      {buffer.length > 0 && <span className="buffer-row">Buffer: {buffer.map(item=>`${item.value} (#${item.id})`).join(', ')}</span>}
    </div>
  )
}

function eventLabel(eventType: AlgorithmEventType) {
  switch (eventType) {
    case 'SELECT': return 'Selecting'
    case 'READ': return 'Reading'
    case 'COMPARE': return 'Comparing'
    case 'SWAP': return 'Swapping'
    case 'WRITE': return 'Writing'
    case 'MARK_SORTED': return 'Marking sorted'
  }
}
