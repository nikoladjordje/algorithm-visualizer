import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlaybackControls } from './PlaybackControls'

function renderControls(overrides = {}) {
  const props = {
    playing: false,
    atStart: false,
    atEnd: false,
    speed: 700,
    onPlayPause: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onReset: vi.fn(),
    onSpeedChange: vi.fn(),
    ...overrides,
  }
  render(<PlaybackControls {...props} />)
  return props
}

describe('PlaybackControls', () => {
  it('supports all controls with accessible names', async () => {
    const user = userEvent.setup()
    const props = renderControls()

    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(screen.getByRole('button', { name: 'Previous step' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Playback speed' }), '350')

    expect(props.onPlayPause).toHaveBeenCalledOnce()
    expect(props.onPrevious).toHaveBeenCalledOnce()
    expect(props.onNext).toHaveBeenCalledOnce()
    expect(props.onReset).toHaveBeenCalledOnce()
    expect(props.onSpeedChange).toHaveBeenCalledWith(350)
  })

  it('exposes paused state and navigation bounds', () => {
    renderControls({ playing: true, atStart: true, atEnd: true })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled()
  })
})
