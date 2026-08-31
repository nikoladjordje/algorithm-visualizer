import { INSERTION_SORT_COMPLEXITY } from '../learning'
export function ComplexityPanel({ items = INSERTION_SORT_COMPLEXITY }: { items?: readonly {label:string;value:string;explanation:string}[] }) {
  return (
    <section className="complexity-panel" aria-labelledby="complexity-title">
      <span className="section-number">04</span>
      <h2 id="complexity-title">Complexity</h2>
      <table>
        <thead><tr><th scope="col">Case</th><th scope="col">Cost</th><th scope="col">Why</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label}><th scope="row">{item.label}</th><td>{item.value}</td><td>{item.explanation}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
