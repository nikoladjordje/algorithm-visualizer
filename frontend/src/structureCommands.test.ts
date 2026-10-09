import { describe, expect, it } from 'vitest'
import { getDataStructureCapability } from './dataStructureCapabilities'
import { parseStructureCommands, serializeStructureCommands } from './structureCommands'

describe('structure commands', () => {
  it('parses Stack commands and standard escaped labels', () => {
    expect(parseStructureCommands('push("A\\nB")\npeek()\npop()', getDataStructureCapability('stack'))).toEqual({
      operations: [{ kind: 'PUSH', value: 'A\nB' }, { kind: 'PEEK' }, { kind: 'POP' }],
    })
  })

  it('serializes canonical Queue operations as editable commands', () => {
    expect(serializeStructureCommands([{ kind: 'ENQUEUE', value: 'A"B' }, { kind: 'DEQUEUE' }, { kind: 'PEEK' }])).toBe('enqueue("A\\"B")\ndequeue()\npeek()')
  })

  it('parses a linked-list prepend with JSON-style label escaping', () => {
    expect(parseStructureCommands('prepend("A\\"B")', getDataStructureCapability('linked-list'))).toEqual({
      operations: [{ kind: 'PREPEND', value: 'A"B' }],
    })
  })

  it('parses a linked-list append with JSON-style label escaping', () => {
    expect(parseStructureCommands('append("A\\"B")', getDataStructureCapability('linked-list'))).toEqual({
      operations: [{ kind: 'APPEND', value: 'A"B' }],
    })
  })

  it.each([
    ['stack', 'push()', 'Line 1: push requires one quoted label.'],
    ['queue', 'push("A")', 'Line 1: push is not available for Queue. Use enqueue, dequeue, or peek.'],
    ['queue', 'enqueue("A") extra', 'Line 1: Use a function-style command such as enqueue("A") or dequeue().'],
    ['stack', 'pop("A")', 'Line 1: pop does not accept a label.'],
    ['stack', 'push("' + 'A'.repeat(41) + '")', 'Line 1: Labels must contain 1–40 characters.'],
  ])('reports an actionable error for %s', (structure, source, message) => {
    expect(parseStructureCommands(source, getDataStructureCapability(structure as 'stack' | 'queue'))).toEqual({ errors: [message] })
  })

  it('reports the command line that prevents replacing the canonical sequence', () => {
    expect(parseStructureCommands('enqueue("A")\nwat()', getDataStructureCapability('queue'))).toEqual({
      errors: ['Line 2: wat is not available for Queue. Use enqueue, dequeue, or peek.'],
    })
  })
})
