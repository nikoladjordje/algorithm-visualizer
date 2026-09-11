import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(process.cwd(), 'src/App.css'), 'utf8')

describe('graph presentation styles', () => {
  it('provides non-color cues and disables graph transitions for reduced motion', () => {
    expect(styles).toContain('.graph-node--unreached')
    expect(styles).toContain('stroke-dasharray: 7 5')
    expect(styles).toContain('.graph-edge--examined')
    expect(styles).toContain('stroke-dasharray: 12 6')
    expect(styles).toContain('.graph-edge--selected-path')
    expect(styles).toContain('stroke-dasharray: 3 5')
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.graph-node, \.graph-edge \{ transition: none !important; \}/)
  })
})
