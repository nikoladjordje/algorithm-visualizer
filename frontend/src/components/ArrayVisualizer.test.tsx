import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { ArrayVisualizer } from './ArrayVisualizer'

describe('ArrayVisualizer', () => {
  it('announces compared indices and current values without relying on color', () => {
    render(<ArrayVisualizer values={[4, 2, -1]} activeIndices={[0, 1]} eventType="COMPARE" complete={false} sortedThrough={0} />)

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Comparing indices 0 and 1. Array values by index: 0: 4, 1: 2, 2: -1',
    )
    expect(document.querySelectorAll('.bar--compare')).toHaveLength(2)
  })

  it('renders swap and completed presentation states', () => {
    const { rerender } = render(<ArrayVisualizer values={[1, 2]} activeIndices={[0, 1]} eventType="SWAP" complete={false} sortedThrough={0} />)
    expect(document.querySelectorAll('.bar--swap')).toHaveLength(2)

    rerender(<ArrayVisualizer values={[1, 2]} activeIndices={[]} complete sortedThrough={1} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(/Sorting complete/)
    expect(document.querySelectorAll('.bar--sorted')).toHaveLength(2)
  })

  it('has no automated accessibility violations', async () => {
    const { container } = render(<ArrayVisualizer values={[3, 1, 2]} activeIndices={[0, 1]} eventType="COMPARE" complete={false} sortedThrough={0} />)
    expect((await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toHaveLength(0)
  })
})
