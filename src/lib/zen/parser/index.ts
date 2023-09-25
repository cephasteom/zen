import peg from 'pegjs';
import { memoize } from '../utils/utils'
import { calculateNormalisedPosition as pos } from '../utils/utils'
import { getPattern } from './euclidean-rhythms'

// Add to window for so that it can be accessed by parser syntax
// @ts-ignore
window.getPattern = getPattern

// TODO: is there a way we can write nicer JS using DRY principles?
// TODO: parse chords and scales e.g. 'Cmaj7' => [0, 4, 7, 11] e.g. Clydian => [0, 2, 4, 5, 7, 9, 11]
// TODO: parse note names e.g. 'C4' => 60
// TODO: binary patterns e.g. '(^1000)*4' => [[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]]
// TODO: Rewrite Zen so it can handle notes that fall between the evaluations...

/*
* Simple pattern parser for generating music patterns
* @returns {any[]} Array of bars, each bar is an array of events
* @example '0 1 2 3' => [[0, 1, 2, 3]] // one bar
* @example '0 1 2 3 | 4 5 6 7' => [[0, 1, 2, 3], [4, 5, 6, 7]] // two bars
* @example '0---- 1-- 2--' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats
* @example '0*4 1*2 2*2' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats alternative syntax
* @example '0?1----' => [[1, 0, 0, 1]] // random choice for four beats
* @example '0?1?2----' => [[2, 1, 2, 0]] 
* @example '0,1----' => [[0, 1, 0, 1]] // alternate for four measures
* @example '0,1,2----' => [[0, 1, 2, 0]]
* @example '[0,1,2,3]' => [[0, 1, 2, 3]] // array of values, useful for chords
* @example '[0,1,2,3]?[4,5,6,7]----' => [[4,5,6,7],[4,5,6,7],[0,1,2,3],[0,1,2,3]] // can be used with random choice
* @example '[0,1,2,3],[4,5,6,7]----' => [[0,1,2,3],[4,5,6,7],[0,1,2,3],[4,5,6,7]] // can be used with alternate
* @example '0..2----' => [[0, 1, 2, 0]] // sequence from 0 to 3
* @example '3..0----' => [[3, 2, 1, 0]] // sequence from 3 to 0
* @example '0..8' => [[0, 1, 2, 3, 4, 5, 6, 7, 8]] // takes the duration from the sequence
* @example '0..10?----' => [[1, 7, 6, 2]] // sequence with random choice
* @example '^10001010*2' => [[1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0]] // binary pattern
* @example '(1 0*3)*4' => [[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]] // group any of the above together, specify how many times the group should repeat in its entirety
*/

const parser = peg.generate(`
    result 
        = bs:bars {
            const format = ({val, dur, type, repeats}) => {
                if (type === 'group') return new Array(repeats).fill(0).map(() => val.map(format).flat()).flat()
                if (type === 'choices') return new Array(dur).fill(0).map(() => val[Math.floor(Math.random() * val.length)])
                if (type === 'alternatives') return new Array(dur).fill(0).map((_, i) => val[i % val.length])
                if (type === 'single') return new Array(dur).fill(0).map(() => val)
                
                return event.val
            }

            return bs.map(bar => bar
                .map(format).flat()
                .map(s => Array.isArray(s) ? s.map(s => !isNaN(+s) ? +s : s) : !isNaN(+s) ? +s : s)
            )
    }

    bars 
        = bar+
    
    bar 
        = values:(group+ / event+) divider? space* { return values; }
    
    group
        = "(" space* val:event+ space* ")" count:duration? space* { return {val, repeats: count || 1, type: 'group'}; }

    event 
        = single / binary / euclidean / sequence / choices / alternatives

    choices 
        = arr:choice+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'choices'}; }

    choice
        = !alternate val:value !alternate choose? { return val }

    alternatives
        = arr:alternative+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'alternatives'}; }

    alternative
        = !choose val:value !choose alternate? { return val }

    single
        = !choose !alternate !seq !"^" !":" val:value dur:duration? !choose !alternate !seq !"^" !":" space* { return {val, dur: dur || 1, type: 'single'}; }

    value 
        = $[a-zA-Z0-9@]+ / $number+ / array 

    sequence
        = start:$[0-9]+ seq end:$[0-9]+ type:(choose?) dur:duration? space* { 
        let step = +start < +end ? 1 : -1
        let size = Math.abs(+end - +start + step)
        return {
            val: new Array(size).fill(0).map((_, i) => +start + i * step), 
            dur: dur || size, 
            type: type === '?' ? 'choices' : 'alternatives'
        }
    }

    euclidean
        = pulses:$[0-9]+ ":" steps:$[0-9]+ dur:duration? space* { 
            const val = getPattern(+pulses, +steps).map(v => ({val: v, dur: 1, type: 'single'}))
            return {
                val,
                repeats: dur || 1,
                type: 'group'
            }
            return e
        }

    binary
        = "^" val:(number+) dur:duration? space* { 
            const bin = val[0].toString().split('')
            return {
                val: bin.map(v => ({val: +v > 0 ? 1 : 0, dur: 1, type: 'single'})),
                repeats: dur || 1,
                type: 'group'
            }
        }

    array 
        = "[" val:$(space* v:value space* ","?)+ "]" { return val.split(',').map(s => s.trim()) }

    number 
        = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) { return +text(); }

    duration
        = count:(ticks / tick) { return count }

    ticks 
        = "*" t:$[0-9]+ { return parseInt(t); }

    tick 
        = "-"* { return text().length; }
        
    seq
        = ".." { return text(); }

    choose
        = "?" { return text(); }

    alternate
        = "," { return text(); }

    divider 
        = "|" 

    space 
        = " "
`);

const parse = memoize((pattern: string, _: string): string|number|[][] => parser.parse(pattern))

export const parsePattern = (pattern: string, t: number, q: number, id: string) => {
    const array = parse(pattern, id)
    let position = pos(t, q, 1, array.length)
    let bar = Math.trunc(position)
    let beat = Math.floor((position % 1) * array[bar].length)
    return array[bar][beat]
}