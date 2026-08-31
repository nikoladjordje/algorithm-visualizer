import { describe,expect,it } from 'vitest'
import { adapters } from './adapters'
describe.each(Object.values(adapters))('$title adapter',(adapter)=>{
 it('covers its pseudocode, metrics, content, and annotations',()=>{expect(adapter.pseudocode.length).toBeGreaterThan(0);expect(adapter.complexity).toHaveLength(4);expect(adapter.presets.map(p=>p.label)).toEqual(['Sorted','Reverse sorted','Duplicates','Negative values']);expect(new Set(adapter.pseudocode.map(line=>line.id)).size).toBe(adapter.pseudocode.length);expect(adapter.metrics.length).toBeGreaterThan(0)})
})
