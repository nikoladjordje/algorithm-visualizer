import type { DataStructureCapability } from '../dataStructureCapabilities'
import { serializeStructureCommands } from '../structureCommands'
import type { StructureOperation } from '../types'

interface StructureAuthoringProps {
  capability: DataStructureCapability
  operations: StructureOperation[]
  commands: string
  inputError?: string
  onOperationsChange: (operations: StructureOperation[]) => void
  onCommandsChange: (commands: string) => void
  onRun: () => void
}

function operationLabel(kind: StructureOperation['kind']) {
  return `${kind.charAt(0)}${kind.slice(1).toLowerCase()}`
}

export function StructureAuthoring({ capability, operations, commands, inputError, onOperationsChange, onCommandsChange, onRun }: StructureAuthoringProps) {
  function replaceOperations(nextOperations: StructureOperation[]) {
    onOperationsChange(nextOperations)
    onCommandsChange(serializeStructureCommands(nextOperations))
  }

  function changeOperation(index: number, kind: StructureOperation['kind']) {
    replaceOperations(operations.map((operation, operationIndex) => operationIndex === index
      ? { kind, ...(kind === capability.valueOperation ? { value: operation.value ?? '' } : {}) }
      : operation))
  }

  function moveOperation(index: number, offset: -1 | 1) {
    const destination = index + offset
    if (destination < 0 || destination >= operations.length) return
    const nextOperations = [...operations]
    ;[nextOperations[index], nextOperations[destination]] = [nextOperations[destination], nextOperations[index]]
    replaceOperations(nextOperations)
  }

  return <div className="input-row structure-authoring">
    <fieldset>
      <legend>{capability.title} operations</legend>
      {operations.map((operation, index) => <div key={index}>
        <label htmlFor={`structure-operation-${index}`}>Operation {index + 1}</label>
        <select id={`structure-operation-${index}`} value={operation.kind} onChange={event => changeOperation(index, event.target.value as StructureOperation['kind'])}>
          {capability.operations.map(kind => <option key={kind} value={kind}>{operationLabel(kind)}</option>)}
        </select>
        {operation.kind === capability.valueOperation && <input aria-label={`${operationLabel(capability.valueOperation)} value ${index + 1}`} value={operation.value ?? ''} onChange={event => replaceOperations(operations.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />}
        <button type="button" onClick={() => moveOperation(index, -1)} disabled={index === 0} aria-label={`Move operation ${index + 1} up`}>↑</button>
        <button type="button" onClick={() => moveOperation(index, 1)} disabled={index === operations.length - 1} aria-label={`Move operation ${index + 1} down`}>↓</button>
        <button type="button" onClick={() => replaceOperations(operations.filter((_, operationIndex) => operationIndex !== index))} aria-label={`Remove operation ${index + 1}`}>Remove</button>
      </div>)}
    </fieldset>
    <label htmlFor="structure-commands">Text commands</label>
    <textarea id="structure-commands" value={commands} onChange={event => onCommandsChange(event.target.value)} aria-describedby="structure-commands-help" aria-invalid={!!inputError} />
    <p id="structure-commands-help">One command per line. Use {capability.operations.map(operation => `${capability.commandNames[operation]}${operation === capability.valueOperation ? '("label")' : '()'}`).join(', or ')}.</p>
    <button type="button" onClick={() => operations.length < 50 && replaceOperations([...operations, { kind: capability.valueOperation, value: '' }])}>Add operation</button>
    <button className="button button--run" onClick={onRun}>Visualize {capability.title}</button>
  </div>
}
