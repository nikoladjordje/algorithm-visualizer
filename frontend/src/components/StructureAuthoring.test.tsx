import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { getDataStructureCapability } from '../dataStructureCapabilities'
import type { StructureOperation } from '../types'
import { StructureAuthoring } from './StructureAuthoring'

function AuthoringHarness() {
  const [operations, setOperations] = useState<StructureOperation[]>([
    { kind: 'ENQUEUE', value: 'A' }, { kind: 'PEEK' }, { kind: 'DEQUEUE' },
  ])
  const [commands, setCommands] = useState('enqueue("A")\npeek()\ndequeue()')
  return <StructureAuthoring capability={getDataStructureCapability('queue')} operations={operations} commands={commands} onOperationsChange={setOperations} onCommandsChange={setCommands} onRun={() => undefined} />
}

function LinkedListAuthoringHarness() {
  const [operations, setOperations] = useState<StructureOperation[]>([{ kind: 'PREPEND', value: 'A' }])
  const [commands, setCommands] = useState('prepend("A")')
  return <StructureAuthoring capability={getDataStructureCapability('linked-list')} operations={operations} commands={commands} onOperationsChange={setOperations} onCommandsChange={setCommands} onRun={() => undefined} />
}

describe('StructureAuthoring', () => {
  it.each(['doubly-linked-list', 'deque'] as const)('loads a synchronized both-ends experiment for %s', async id => {
    const user = userEvent.setup()
    function Harness() {
      const [operations, setOperations] = useState<StructureOperation[]>([])
      const [commands, setCommands] = useState('')
      return <StructureAuthoring capability={getDataStructureCapability(id)} operations={operations} commands={commands} onOperationsChange={setOperations} onCommandsChange={setCommands} onRun={() => undefined} />
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Load both-ends experiment' }))
    expect(screen.getByLabelText('Text commands')).toHaveValue(id === 'deque'
      ? 'addFirst("A")\naddLast("A")\naddFirst("B")\npeekFirst()\npeekLast()\nremoveLast()\nremoveFirst()\nremoveFirst()\npeekLast()'
      : 'prepend("A")\nappend("A")\nprepend("B")\nremoveLast()\nremoveFirst()\nremoveFirst()\nremoveLast()')
    expect(screen.getAllByLabelText(/Operation \d/)).toHaveLength(id === 'deque' ? 9 : 7)
  })
  it('edits, reorders, and removes rows while keeping the command text synchronized', async () => {
    const user = userEvent.setup()
    render(<AuthoringHarness />)

    await user.click(screen.getByRole('button', { name: 'Move operation 3 up' }))
    expect(screen.getAllByLabelText(/Operation \d/).map(select => (select as HTMLSelectElement).value)).toEqual(['ENQUEUE', 'DEQUEUE', 'PEEK'])
    expect(screen.getByLabelText('Text commands')).toHaveValue('enqueue("A")\ndequeue()\npeek()')

    await user.click(screen.getByRole('button', { name: 'Remove operation 2' }))
    expect(screen.getByLabelText('Text commands')).toHaveValue('enqueue("A")\npeek()')
  })

  it('synchronizes a structured linked-list head removal as a valid text command', async () => {
    const user = userEvent.setup()
    render(<LinkedListAuthoringHarness />)

    expect(screen.getByRole('option', { name: 'Remove First' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Operation 1'), 'REMOVE_FIRST')

    expect(screen.getByLabelText('Text commands')).toHaveValue('removeFirst()')
  })
})
