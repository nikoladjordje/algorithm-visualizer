import { describe, expect, it } from 'vitest'
import { parseIntegerList } from './input'

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
