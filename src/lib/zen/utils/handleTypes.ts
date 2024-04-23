import type { patternValue } from '../types'
import { parsePattern } from '../parsing/mininotation';
import { Pattern } from '../classes/Pattern'

export function handleTypes(
        value: patternValue | Pattern | string | Function, 
        t: number, 
        q: number,
        id: string,
        measurements?: number[],
        probabilities?: number[]
    ) : patternValue {
    if(value instanceof Pattern) return value.get(t, q, 120, measurements, probabilities) || 0
    if(typeof value === 'function') return value(t, q)
    if(typeof value === 'string') return parsePattern(value, t, q, id, true)
    return value
}