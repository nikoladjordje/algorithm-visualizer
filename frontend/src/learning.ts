import type { AlgorithmEvent } from './types'

export const INSERTION_SORT_LINES = [
  { id: 'outer-loop', text: 'for i ← 1 to length(array) − 1' },
  { id: 'select-current', text: '    select array[i]; j ← i' },
  { id: 'read-adjacent', text: '    read array[j − 1] and array[j]' },
  { id: 'compare-adjacent', text: '    while j > 0 and array[j − 1] > array[j]' },
  { id: 'swap-adjacent', text: '        swap array[j − 1] and array[j]' },
  { id: 'write-swapped-values', text: '        write the swapped values' },
  { id: 'move-left', text: '        j ← j − 1' },
  { id: 'complete-pass', text: '    mark array[0…i] as sorted' },
] as const

export const INSERTION_SORT_COMPLEXITY = [
  { label: 'Best', value: 'O(n)', explanation: 'Already sorted input needs one comparison per pass.' },
  { label: 'Average', value: 'O(n²)', explanation: 'Values typically move across part of the sorted prefix.' },
  { label: 'Worst', value: 'O(n²)', explanation: 'Reverse-sorted input moves every value across the full prefix.' },
  { label: 'Space', value: 'O(1)', explanation: 'Sorting happens in place with constant extra storage.' },
] as const

export const PRESETS = [
  { label: 'Sorted', values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: 'Reverse sorted', values: [8, 7, 6, 5, 4, 3, 2, 1] },
  { label: 'Duplicates', values: [5, 3, 5, 2, 3, 1, 5, 2] },
  { label: 'Negative values', values: [-3, 7, -1, -8, 4, 0, -5] },
] as const

export function explainEvent(event: AlgorithmEvent): string {
  switch (event.type) {
    case 'SELECT':
      return `Select ${event.data.value} at index ${event.data.index} as the value being inserted into the sorted prefix.`
    case 'READ':
      return `Read ${event.data.readValues[0]} and ${event.data.readValues[1]} so their order can be checked.`
    case 'COMPARE': {
      const [left, right] = event.data.operands
      if (event.data.result === 'GREATER') return `Compare ${left} and ${right}. ${left} is greater, so these adjacent values must be swapped.`
      if (event.data.result === 'EQUAL') return `Compare ${left} and ${right}. They are equal, so their order is already valid and this insertion stops.`
      return `Compare ${left} and ${right}. ${left} is smaller, so the pair is ordered and this insertion stops.`
    }
    case 'SWAP':
      return `Swap indices ${event.data.indices.join(' and ')} because the value on the left is greater.`
    case 'WRITE':
      return `Write ${event.data.writtenValues[0]} and ${event.data.writtenValues[1]} into indices ${event.data.indices.join(' and ')}.`
    case 'MARK_SORTED':
      return `Pass ${event.pass} is complete, so positions ${event.data.fromIndex} through ${event.data.throughIndex} now form a sorted prefix.`
    default:
      return 'Advance the algorithm.'
  }
}
