import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ComplexityPanel } from './ComplexityPanel'
import { PseudocodePanel } from './PseudocodePanel'
import { Timeline } from './Timeline'

describe('learning panels', () => {
  it('highlights the active pseudocode line', () => {
    render(<PseudocodePanel activeLineId="swap-adjacent" />)
    expect(screen.getByText(/swap array/).closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('renders algorithm complexity as an accessible table', () => {
    render(<ComplexityPanel />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Best' })).toBeInTheDocument()
    expect(screen.getAllByText('O(n²)')).toHaveLength(2)
    expect(screen.getByText(/Already sorted input/)).toBeInTheDocument()
  })

  it('moves through the timeline with an accessible value', async () => {
    const onChange = vi.fn()
    render(<Timeline position={3} eventCount={10} disabled={false} onChange={onChange} />)
    const timeline = screen.getByRole('slider', { name: 'Timeline' })
    expect(timeline).toHaveAttribute('aria-valuetext', 'Step 3 of 10')
    fireEvent.keyDown(timeline, { key: 'End' })
    expect(onChange).toHaveBeenCalledWith(10)
  })
})
