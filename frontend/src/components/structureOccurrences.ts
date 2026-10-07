export function occurrenceDescriptions(values: string[], occurrenceIds: number[]) {
  return values.map((value, index) => {
    const matchingIndexes = values.map((item, itemIndex) => item === value ? itemIndex : -1).filter(itemIndex => itemIndex >= 0)
    if (matchingIndexes.length < 2) return undefined
    const orderedIds = matchingIndexes.map(itemIndex => occurrenceIds[itemIndex]).sort((first, second) => first - second)
    return orderedIds.indexOf(occurrenceIds[index]) + 1
  })
}
