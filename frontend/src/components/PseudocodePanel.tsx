import { INSERTION_SORT_LINES } from '../learning'
interface PseudocodePanelProps {
  activeLineId?: string
  lines?: readonly { id:string; text:string }[]
}

export function PseudocodePanel({ activeLineId, lines = INSERTION_SORT_LINES }: PseudocodePanelProps) {
  return (
    <section className="pseudocode-panel" aria-labelledby="pseudocode-title">
      <span className="section-number">03</span>
      <h2 id="pseudocode-title">Pseudocode</h2>
      <ol className="code-lines">
        {lines.map((line, index) => (
          <li key={line.id} className={line.id === activeLineId ? 'code-line--active' : ''} aria-current={line.id === activeLineId ? 'step' : undefined}>
            <span>{index + 1}</span><code>{line.text}</code>
          </li>
        ))}
      </ol>
    </section>
  )
}
