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

describe('StructureAuthoring', () => {
  it('edits, reorders, and removes rows while keeping the command text synchronized', async () => {
    const user = userEvent.setup()
    render(<AuthoringHarness />)

    await user.click(screen.getByRole('button', { name: 'Move operation 3 up' }))
    expect(screen.getAllByLabelText(/Operation \d/).map(select => (select as HTMLSelectElement).value)).toEqual(['ENQUEUE', 'DEQUEUE', 'PEEK'])
    expect(screen.getByLabelText('Text commands')).toHaveValue('enqueue("A")\ndequeue()\npeek()')

    await user.click(screen.getByRole('button', { name: 'Remove operation 2' }))
    expect(screen.getByLabelText('Text commands')).toHaveValue('enqueue("A")\npeek()')
  })
})
