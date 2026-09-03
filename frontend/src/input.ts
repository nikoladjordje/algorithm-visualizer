export const MAX_VALUES = 50

export interface ParsedGraph {
  nodes: string[]
  edges: { from: string; to: string }[]
}

export interface GraphInputValidation {
  graph: ParsedGraph | null
  error: string | null
}

const labelPattern = '(?:"([A-Za-z0-9_-]{1,16})"|([A-Za-z0-9_]{1,16}))'
const standalonePattern = new RegExp(`^${labelPattern}$`)
const edgePattern = new RegExp(`^${labelPattern}\\s*-\\s*${labelPattern}$`)

export function validateGraphInput(input: string): GraphInputValidation {
  const nodes: string[] = []
  const edges: ParsedGraph['edges'] = []
  const standaloneLines = new Map<string, number>()
  const firstNodeLines = new Map<string, number>()
  const edgeLines = new Map<string, number>()
  const addNode = (node: string, lineNumber: number) => {
    if (!nodes.includes(node)) {
      nodes.push(node)
      firstNodeLines.set(node, lineNumber)
    }
  }

  for (const [index, rawLine] of input.split('\n').entries()) {
    const lineNumber = index + 1
    const line = rawLine.trim()
    if (!line) continue
    const edge = edgePattern.exec(line)
    if (edge) {
      const from = edge[1] ?? edge[2]
      const to = edge[3] ?? edge[4]
      if (from === to) return { graph: null, error: `Line ${lineNumber}: self-loops are not allowed.` }
      if (edges.length === 66) return { graph: null, error: 'A graph may contain at most 66 edges.' }
      const key = [from, to].sort().join('\0')
      const originalLine = edgeLines.get(key)
      if (originalLine) {
        return { graph: null, error: `Line ${lineNumber}: duplicate edge; first declared on line ${originalLine}.` }
      }
      edgeLines.set(key, lineNumber)
      addNode(from, lineNumber)
      addNode(to, lineNumber)
      if (nodes.length > 12) return { graph: null, error: 'A graph may contain at most 12 nodes.' }
      edges.push({ from, to })
      continue
    }
    const standalone = standalonePattern.exec(line)
    if (!standalone) {
      const reason = line.includes('"') ? 'malformed quoted label' : 'invalid node label or edge'
      return { graph: null, error: `Line ${lineNumber}: ${reason}. Use labels with 1–16 letters, numbers, underscores, or a quoted hyphenated label.` }
    }
    const node = standalone[1] ?? standalone[2]
    const originalLine = standaloneLines.get(node) ?? firstNodeLines.get(node)
    if (originalLine) {
      return { graph: null, error: `Line ${lineNumber}: duplicate node label; first declared on line ${originalLine}.` }
    }
    standaloneLines.set(node, lineNumber)
    addNode(node, lineNumber)
    if (nodes.length > 12) return { graph: null, error: 'A graph may contain at most 12 nodes.' }
  }

  return nodes.length
    ? { graph: { nodes, edges }, error: null }
    : { graph: null, error: 'Enter at least one node.' }
}

export function parseGraphInput(input: string): ParsedGraph | null {
  return validateGraphInput(input).graph
}

export function parseIntegerList(input: string): number[] | null {
  const parts = input.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0 || parts.length > MAX_VALUES) return null
  const values = parts.map(Number)
  return values.every((value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647) ? values : null
}
