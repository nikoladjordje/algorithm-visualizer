interface TimelineProps {
  position: number
  eventCount: number
  disabled: boolean
  onChange: (position: number) => void
}

export function Timeline({ position, eventCount, disabled, onChange }: TimelineProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const destinations: Record<string, number> = {
      Home: 0,
      End: eventCount,
      ArrowLeft: Math.max(0, position - 1),
      ArrowDown: Math.max(0, position - 1),
      ArrowRight: Math.min(eventCount, position + 1),
      ArrowUp: Math.min(eventCount, position + 1),
    }
    if (event.key in destinations) {
      event.preventDefault()
      onChange(destinations[event.key])
    }
  }

  return (
    <div className="timeline">
      <label htmlFor="trace-timeline">Timeline</label>
      <input
        id="trace-timeline"
        type="range"
        min={0}
        max={Math.max(0, eventCount)}
        value={position}
        disabled={disabled}
        aria-valuetext={position === 0 ? 'Initial array' : `Step ${position} of ${eventCount}`}
        onChange={(event) => onChange(Number(event.target.value))}
        onKeyDown={handleKeyDown}
      />
      <output htmlFor="trace-timeline">{position} / {eventCount}</output>
    </div>
  )
}
