import peg from 'pegjs';
import { memoize } from '../utils/utils'
import { calculateNormalisedPosition as pos } from '../utils/utils'

// TODO: is there a way we can write nicer JS using DRY principles?
// TODO: for event triggering it would be nice to have shorthand for rests. e.g. '1/1/1/1'
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
*/
const parser = peg.generate(`
    result 
        = bs:bars {
        return bs.map(bar => bar
        .map(({val, dur, type}) => {
            if (type === 'choices') return new Array(dur).fill(0).map(() => val[Math.floor(Math.random() * val.length)])
            if (type === 'alternatives') return new Array(dur).fill(0).map((_, i) => val[i % val.length])
            return event.val
        })
        .flat()
        .map(s => Array.isArray(s) ? s.map(s => !isNaN(+s) ? +s : s) : !isNaN(+s) ? +s : s)
        )
    }

    bars 
        = bar+

    bar 
        = values:event+ divider? space* { return values; }

    event 
        = sequence / choices / alternatives

    choices 
        = arr:choice+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'choices'}; }

    choice
        = !alternate val:value !alternate choose? { return val }

    alternatives
        = arr:alternative+ dur:duration space* { return {val: arr, dur: dur || 1, type: 'alternatives'}; }

    alternative
        = !choose val:value !choose alternate? { return val }

    value 
        = $[a-zA-Z0-9@]+ / $number+ / array

    sequence
        = start:$[0-9]+ ".." end:$[0-9]+ type:(choose?) dur:duration? space* { 
        let step = +start < +end ? 1 : -1
        let size = Math.abs(+end - +start + step)
        return {
        val: new Array(size).fill(0).map((_, i) => +start + i * step), 
        dur: dur || size, 
        type: type === '?' ? 'choices' : 'alternatives'
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

    choose
        = "?" { return text(); }

    alternate
        = "," { return text(); }

    divider 
        = "|"

    space 
        = " "
`);

// TODO: is this worth it?
// Not memoizing will create a lot of garbage
const parse = memoize((pattern: string, _: string): string|number|[][] => parser.parse(pattern))
// const parse = (pattern: string) => parser.parse(pattern)

export const parsePattern = (pattern: string, t: number, q: number, id: string) => {
    const array = parse(pattern, id)
    let position = pos(t, q, 1, array.length)
    let bar = Math.trunc(position)
    let beat = Math.floor((position % 1) * array[bar].length)
    return array[bar][beat]
}