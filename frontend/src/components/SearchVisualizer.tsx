interface SearchVisualizerProps {
  values: number[]
  target: number
  selectedIndex?: number
  inspectedIndices: number[]
  foundIndex?: number
}

export function SearchVisualizer({ values, target, selectedIndex, inspectedIndices, foundIndex }: SearchVisualizerProps) {
  const description = values.length ? values.map((value, index) => `${index}: ${value}`).join(', ') : 'empty'

  return <div className="search-visualizer" role="img" aria-label={`Search values by index: ${description}. Target: ${target}.`}>
    {values.length === 0 ? <p className="search-empty">No values to inspect</p> : <ol className="search-cells">
      {values.map((value, index) => {
        const isCandidate = selectedIndex === index
        const isInspected = inspectedIndices.includes(index)
        const isFound = foundIndex === index
        const stateLabels = [isCandidate && 'candidate', isInspected && 'inspected', isFound && 'match'].filter(Boolean)
        return <li className={`search-cell${isCandidate ? ' search-cell--candidate' : ''}${isInspected ? ' search-cell--inspected' : ''}${isFound ? ' search-cell--found' : ''}`} key={index}>
          <span className="search-cell__value">{value}</span>
          <span className="search-cell__index">index {index}</span>
          {stateLabels.length > 0 && <span className="search-cell__state">{stateLabels.join(', ')}</span>}
        </li>
      })}
    </ol>}
  </div>
}
