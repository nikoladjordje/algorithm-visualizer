interface SearchVisualizerProps {
  values: number[]
  target: number
  selectedIndex?: number
  inspectedIndices: number[]
  foundIndex?: number
  lowerBound?: number
  upperBound?: number
}

export function SearchVisualizer({ values, target, selectedIndex, inspectedIndices, foundIndex, lowerBound, upperBound }: SearchVisualizerProps) {
  const description = values.length ? values.map((value, index) => `${index}: ${value}`).join(', ') : 'empty'
  const hasInterval = lowerBound !== undefined && upperBound !== undefined
  const intervalDescription = hasInterval ? ` Inclusive interval: ${lowerBound} through ${upperBound}${lowerBound > upperBound ? ' (empty)' : ''}.` : ''

  return <div className="search-visualizer" role="img" aria-label={`Search values by index: ${description}. Target: ${target}.${intervalDescription}`}>
    {hasInterval && <p className="search-interval">Inclusive interval: {lowerBound} through {upperBound}{lowerBound > upperBound ? ' (empty)' : ''}</p>}
    {values.length === 0 ? <p className="search-empty">No values to inspect</p> : <ol className="search-cells">
      {values.map((value, index) => {
        const isCandidate = selectedIndex === index
        const isInspected = inspectedIndices.includes(index)
        const isFound = foundIndex === index
        const isInInterval = !hasInterval || (index >= lowerBound && index <= upperBound)
        const stateLabels = [isCandidate && 'candidate', isInspected && 'inspected', !isInInterval && 'discarded', isFound && 'match'].filter(Boolean)
        return <li className={`search-cell${isCandidate ? ' search-cell--candidate' : ''}${isInspected ? ' search-cell--inspected' : ''}${!isInInterval ? ' search-cell--discarded' : ''}${isFound ? ' search-cell--found' : ''}`} key={index}>
          <span className="search-cell__value">{value}</span>
          <span className="search-cell__index">index {index}</span>
          {stateLabels.length > 0 && <span className="search-cell__state">{stateLabels.join(', ')}</span>}
        </li>
      })}
    </ol>}
  </div>
}
