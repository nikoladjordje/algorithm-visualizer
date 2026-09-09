import type { GraphEdge } from '../types'

type Point = { x: number; y: number }
export interface WeightLabel extends Point {
  edge: GraphEdge
  anchor: Point
}

function distanceToEdge(point: Point, from: Point, to: Point): number {
  const dx = to.x - from.x, dy = to.y - from.y
  const fraction = Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(point.x - from.x - fraction * dx, point.y - from.y - fraction * dy)
}

export function graphLayout(nodes: string[], edges: GraphEdge[]) {
  const weighted = edges.some(edge => edge.weight !== undefined)
  // Keep the unweighted layout stable. Weighted graphs get room for readable badges,
  // long node labels, and all 66 edges; the viewport scrolls instead of shrinking text.
  const radius = Math.max(190, nodes.length * 50)
  const width = weighted ? 2 * radius + 240 : 520
  const height = weighted ? width : 360
  const positions: Record<string, Point> = Object.fromEntries(nodes.map((node, index) => {
    if (nodes.length === 1) return [node, { x: 260, y: 175 }]
    const angle = -Math.PI / 2 + 2 * Math.PI * index / nodes.length
    return [node, weighted
      ? { x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) }
      : { x: 260 + 190 * Math.cos(angle), y: 175 + 125 * Math.sin(angle) }]
  }))
  const labels: WeightLabel[] = []
  const available = (point: Point) => point.x >= 20 && point.x <= width - 20
    && point.y >= 20 && point.y <= height - 20
    && nodes.every(node => Math.abs(point.x - positions[node].x) > 125 || Math.abs(point.y - positions[node].y) > 65)
    && labels.every(label => Math.abs(point.x - label.x) >= 36 || Math.abs(point.y - label.y) >= 28)
    && edges.every(edge => distanceToEdge(point, positions[edge.from], positions[edge.to]) >= 22)

  for (const edge of edges.filter(edge => edge.weight !== undefined)) {
    const from = positions[edge.from], to = positions[edge.to]
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy)
    let placement: WeightLabel | undefined
    for (const offset of [24, -24, 40, -40, 64, -64, 96, -96, 144, -144]) {
      for (const fraction of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8]) {
        const anchor = { x: from.x + fraction * dx, y: from.y + fraction * dy }
        const point = { x: anchor.x - offset * dy / length, y: anchor.y + offset * dx / length }
        if (available(point)) {
          placement = { ...point, edge, anchor }
          break
        }
      }
      if (placement) break
    }
    // Dense crossings can consume the space immediately beside an edge. Find the
    // nearest free grid location and keep an explicit connector to that edge.
    if (!placement) {
      const anchor = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
      let bestDistance = Infinity
      for (let x = 24; x < width - 20; x += 36) {
        for (let y = 24; y < height - 20; y += 28) {
          const point = { x, y }, distance = Math.hypot(x - anchor.x, y - anchor.y)
          if (distance < bestDistance && available(point)) {
            placement = { ...point, edge, anchor }
            bestDistance = distance
          }
        }
      }
    }
    if (placement) labels.push(placement)
  }
  return { positions, labels, width, height, weighted }
}
