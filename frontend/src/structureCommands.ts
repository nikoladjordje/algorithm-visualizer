import type { StructureOperation } from './types'
import type { DataStructureCapability } from './dataStructureCapabilities'

export type StructureCommandParseResult =
  | { operations: StructureOperation[] }
  | { errors: string[] }

function error(line: number, message: string) {
  return `Line ${line}: ${message}`
}

function availableCommands(capability: DataStructureCapability) {
  const commands = capability.operations.map(operation => capability.commandNames[operation])
  return `${commands.slice(0, -1).join(', ')}, or ${commands.at(-1)}`
}

function commandExample(capability: DataStructureCapability) {
  const valueOperation = capability.valueOperations[0]
  const noValueOperation = capability.operations.find(operation => !capability.valueOperations.includes(operation))
  return noValueOperation
    ? `${capability.commandNames[valueOperation]}("A") or ${capability.commandNames[noValueOperation]}()`
    : `${capability.commandNames[valueOperation]}("A")`
}

export function parseStructureCommands(source: string, capability: DataStructureCapability): StructureCommandParseResult {
  const operations: StructureOperation[] = []
  const errors: string[] = []

  source.split('\n').forEach((line, index) => {
    if (!line.trim()) return
    const match = line.match(/^\s*([a-z]+)\s*\((.*)\)\s*$/)
    if (!match) {
      errors.push(error(index + 1, `Use a function-style command such as ${commandExample(capability)}.`))
      return
    }

    const [, command, argument] = match
    const operation = capability.operations.find(kind => capability.commandNames[kind] === command)
    if (!operation) {
      errors.push(error(index + 1, `${command} is not available for ${capability.title}. Use ${availableCommands(capability)}.`))
      return
    }

    const takesLabel = capability.valueOperations.includes(operation)
    if (!takesLabel && argument.trim()) {
      errors.push(error(index + 1, `${command} does not accept a label.`))
      return
    }
    if (takesLabel && !argument.trim()) {
      errors.push(error(index + 1, `${command} requires one quoted label.`))
      return
    }
    if (!takesLabel) {
      operations.push({ kind: operation })
      return
    }

    try {
      const value: unknown = JSON.parse(argument)
      if (typeof value !== 'string') throw new Error('not a string')
      if (!value.length || value.length > 40) {
        errors.push(error(index + 1, 'Labels must contain 1–40 characters.'))
        return
      }
      operations.push({ kind: operation, value })
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
