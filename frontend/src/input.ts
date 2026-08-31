export const MAX_VALUES = 50

export function parseIntegerList(input: string): number[] | null {
  const parts = input.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0 || parts.length > MAX_VALUES) return null
  const values = parts.map(Number)
  return values.every((value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647) ? values : null
}
