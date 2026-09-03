import { describe, expect, it } from 'vitest'
import { graphPresets } from './graphPresets'
import { parseGraphInput } from './input'

describe('graphPresets', () => {
  it('provides branching, cycle, and disconnected graphs with fixed valid starts', () => {
    expect(graphPresets.map(preset => preset.label)).toEqual(['Branching', 'Cycle', 'Disconnected'])
    expect(graphPresets.map(preset => preset.input)).toMatchInlineSnapshot(`
      [
        "A-B
      A-C
      B-D
      B-E
      C-F",
        "A-B
      B-C
      C-D
      D-A
      B-D",
        "A-B
      B-C
      D-E
      F",
      ]
    `)
    for (const preset of graphPresets) {
      expect(parseGraphInput(preset.input)?.nodes).toContain(preset.startNode)
    }
  })
})
