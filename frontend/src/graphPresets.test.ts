import { describe, expect, it } from 'vitest'
import { graphPresets } from './graphPresets'
import { parseGraphInput } from './input'

describe('graphPresets', () => {
  it('provides valid comparison experiments with fixed starts and destinations', () => {
    expect(graphPresets.map(preset => preset.label)).toEqual([
      'DFS depth', 'Cycle', 'Disconnected', 'Edges vs cost', 'Mixed weights',
      'Equal-cost tie', 'Unreachable destination',
    ])
    for (const preset of graphPresets) {
      const graph = parseGraphInput(preset.input)
      expect(graph?.nodes).toContain(preset.startNode)
      expect(graph?.nodes).toContain(preset.destination)
      expect(preset.description).not.toBe('')
    }
    expect(graphPresets.find(preset => preset.label === 'Edges vs cost')?.input).toBe('A-D:9\nA-B:2\nB-C\nC-D:2')
    expect(graphPresets.find(preset => preset.label === 'Mixed weights')?.input).toContain('A-C\n')
    expect(graphPresets.find(preset => preset.label === 'Unreachable destination')?.destination).toBe('D')
  })
})
