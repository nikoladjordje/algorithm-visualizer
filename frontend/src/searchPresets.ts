export interface SearchPreset {
  label: string
  values: readonly number[]
  target: number
  description: string
}

export const searchPresets: readonly SearchPreset[] = [
  { label: 'Immediate hit', values: [5, 7, 9], target: 5, description: 'The first value is a match.' },
  { label: 'Late linear hit', values: [1, 3, 5, 7, 9], target: 9, description: 'Linear search inspects every value before the match.' },
  { label: 'Not found', values: [1, 3, 5, 7], target: 4, description: 'The target is absent from the sequence.' },
  { label: 'Duplicates', values: [1, 3, 3, 3, 5], target: 3, description: 'Both algorithms stop at their own first equality.' },
  { label: 'Narrow both ways', values: [1, 3, 5, 7, 9, 11, 13], target: 9, description: 'Binary search narrows right, then left, before finding the target.' },
  { label: 'Empty sequence', values: [], target: 4, description: 'A valid no-work not-found outcome.' },
]
