import { describe, expect, it } from 'vitest'
import { parseGraphInput, parseIntegerList, validateGraphInput } from './input'

describe('parseIntegerList', () => {
  it('accepts commas, whitespace, negatives, and duplicates', () => {
    expect(parseIntegerList('3, -1  3\n2')).toEqual([3, -1, 3, 2])
  })

  it.each(['', '   ', '1.5, 2', '2, nope', `${Number.MAX_SAFE_INTEGER + 1}`])(
    'rejects invalid input %j',
    (input) => expect(parseIntegerList(input)).toBeNull(),
  )

  it('accepts 50 values and rejects 51', () => {
    expect(parseIntegerList(Array.from({ length: 50 }, (_, index) => index).join(','))).toHaveLength(50)
    expect(parseIntegerList(Array.from({ length: 51 }, (_, index) => index).join(','))).toBeNull()
  })
})

describe('parseGraphInput', () => {
  it('parses nodes and edges in first-appearance order', () => {
    expect(parseGraphInput('  A-C\nA-B\n\nD\n"node-one" - C  ')).toEqual({
      nodes: ['A', 'C', 'B', 'D', 'node-one'],
      edges: [
        { from: 'A', to: 'C' },
        { from: 'A', to: 'B' },
        { from: 'node-one', to: 'C' },
      ],
    })
  })

  it.each([
    ['A\nA', 'Line 2: duplicate node label; first declared on line 1.'],
    ['A-A', 'Line 1: self-loops are not allowed.'],
    ['A-B\nB-A', 'Line 2: duplicate edge; first declared on line 1.'],
    ['A-B\nA-B', 'Line 2: duplicate edge; first declared on line 1.'],
    ['"unterminated', 'Line 1: malformed quoted label.'],
    ['bad label', 'Line 1: invalid node label or edge.'],
  ])('rejects %j with precise feedback', (input, detail) => {
    expect(validateGraphInput(input).error).toContain(detail)
    expect(parseGraphInput(input)).toBeNull()
  })

  it('enforces graph size limits while accepting their boundaries', () => {
    const nodes = Array.from({ length: 12 }, (_, index) => `N${index}`)
    const completeGraph = nodes.flatMap((from, index) =>
      nodes.slice(index + 1).map(to => `${from}-${to}`))
    expect(completeGraph).toHaveLength(66)
    expect(parseGraphInput(completeGraph.join('\n'))?.nodes).toHaveLength(12)
    expect(validateGraphInput(`${nodes.join('\n')}\nN12`).error).toContain('at most 12 nodes')
    expect(validateGraphInput(`${completeGraph.join('\n')}\nN0-N1`).error).toContain('at most 66 edges')
  })
})
