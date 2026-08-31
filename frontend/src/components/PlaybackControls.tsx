interface PlaybackControlsProps {
  playing: boolean
  atStart: boolean
  atEnd: boolean
  speed: number
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

export function PlaybackControls(props: PlaybackControlsProps) {
  const { playing, atStart, atEnd, speed, onPlayPause, onPrevious, onNext, onReset, onSpeedChange } = props
  return (
    <div className="playback">
      <div className="button-group" aria-label="Playback controls">
        <button type="button" className="button button--primary" onClick={onPlayPause} disabled={atEnd}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" className="button" onClick={onPrevious} disabled={atStart}>Previous step</button>
        <button type="button" className="button" onClick={onNext} disabled={atEnd}>Next step</button>
        <button type="button" className="button" onClick={onReset} disabled={atStart}>Reset</button>
      </div>
      <label className="speed-control">
        Playback speed
        <select value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))}>
          <option value={1200}>0.5×</option><option value={700}>1×</option>
          <option value={350}>2×</option><option value={175}>4×</option>
        </select>
      </label>
    </div>
  )
}
