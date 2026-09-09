import { describe, expect, it } from 'vitest'
import { graphLayout } from './graphLayout'

describe('weighted graph layout', () => {
  it.each(Array.from({ length: 11 }, (_, index) => index + 2))('keeps all weights separate from nodes and other badges for a complete %i-node graph', count => {
    const nodes = Array.from({ length: count }, (_, index) => `long_node_${index}`)
    const edges = nodes.flatMap((from, index) => nodes.slice(index + 1).map(to => ({ from, to, weight: 99 })))
    const layout = graphLayout(nodes, edges)
    expect(layout.labels).toHaveLength(edges.length)
    for (const [index, label] of layout.labels.entries()) {
      expect(label.x).toBeGreaterThan(14)
      expect(label.x).toBeLessThan(layout.width - 14)
      expect(label.y).toBeGreaterThan(10)
      expect(label.y).toBeLessThan(layout.height - 10)
      for (const point of Object.values(layout.positions)) {
        expect(Math.abs(label.x - point.x) > 110 || Math.abs(label.y - point.y) > 55).toBe(true)
      }
      for (const other of layout.labels.slice(index + 1)) {
        expect(Math.abs(label.x - other.x) >= 28 || Math.abs(label.y - other.y) >= 20).toBe(true)
      }
    }
    expect(graphLayout(nodes, edges)).toEqual(layout)
  })
})
