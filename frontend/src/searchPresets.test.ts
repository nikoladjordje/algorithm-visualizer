import { describe, expect, it } from 'vitest'
import { searchPresets } from './searchPresets'

describe('search presets', () => {
  it('provides valid comparable experiments without automatic execution', () => {
    expect(searchPresets.map(preset => preset.label)).toEqual([
      'Immediate hit', 'Late linear hit', 'Not found', 'Duplicates', 'Narrow both ways', 'Empty sequence',
    ])
    expect(searchPresets.find(preset => preset.label === 'Narrow both ways')).toMatchObject({
      values: [1, 3, 5, 7, 9, 11, 13], target: 9,
    })
    expect(searchPresets.every(preset => preset.values.every((value, index, values) => index === 0 || values[index - 1] <= value))).toBe(true)
  })
})
