import type { StructureOperation } from './types'

type StructureId = 'stack' | 'queue'

export type StructureCommandParseResult =
  | { operations: StructureOperation[] }
  | { errors: string[] }

const commandsByStructure = {
  stack: ['push', 'pop', 'peek'],
  queue: ['enqueue', 'dequeue', 'peek'],
} as const

function error(line: number, message: string) {
  return `Line ${line}: ${message}`
}

function operationKind(command: string): StructureOperation['kind'] {
  return command.toUpperCase() as StructureOperation['kind']
}

function availableCommands(structure: StructureId) {
  const commands = commandsByStructure[structure]
  return `${commands.slice(0, -1).join(', ')}, or ${commands.at(-1)}`
}

export function parseStructureCommands(source: string, structure: StructureId): StructureCommandParseResult {
  const operations: StructureOperation[] = []
  const errors: string[] = []

  source.split('\n').forEach((line, index) => {
    if (!line.trim()) return
    const match = line.match(/^\s*([a-z]+)\s*\((.*)\)\s*$/)
    if (!match) {
      errors.push(error(index + 1, `Use a function-style command such as ${structure === 'queue' ? 'enqueue("A") or dequeue()' : 'push("A") or pop()'}.`))
      return
    }

    const [, command, argument] = match
    if (!commandsByStructure[structure].includes(command as never)) {
      errors.push(error(index + 1, `${command} is not available for ${structure === 'queue' ? 'Queue' : 'Stack'}. Use ${availableCommands(structure)}.`))
      return
    }

    const takesLabel = command === 'push' || command === 'enqueue'
    if (!takesLabel && argument.trim()) {
      errors.push(error(index + 1, `${command} does not accept a label.`))
      return
    }
    if (takesLabel && !argument.trim()) {
      errors.push(error(index + 1, `${command} requires one quoted label.`))
      return
    }
    if (!takesLabel) {
      operations.push({ kind: operationKind(command) })
      return
    }

    try {
      const value: unknown = JSON.parse(argument)
      if (typeof value !== 'string') throw new Error('not a string')
      if (!value.length || value.length > 40) {
        errors.push(error(index + 1, 'Labels must contain 1–40 characters.'))
        return
      }
      operations.push({ kind: operationKind(command), value })
    } catch {
      errors.push(error(index + 1, `${command} requires one quoted label.`))
    }
  })

  if (!errors.length && !operations.length) errors.push(error(1, 'Provide at least one command.'))
  if (!errors.length && operations.length > 50) errors.push(error(51, 'Use at most 50 commands.'))
  return errors.length ? { errors } : { operations }
}

export function serializeStructureCommands(operations: StructureOperation[]) {
  return operations.map(operation => operation.value === undefined ? `${operation.kind.toLowerCase()}()` : `${operation.kind.toLowerCase()}(${JSON.stringify(operation.value)})`).join('\n')
}
