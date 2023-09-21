import peg from 'pegjs';
import { memoize } from '../utils/utils'
/*
 * Simple pattern parser for generating music patterns
 * @returns {any[]} Array of bars, each bar is an array of events
 * @example '0 1 2 3' => [[0, 1, 2, 3]] // one bar
 * @example '0 1 2 3 | 4 5 6 7' => [[0, 1, 2, 3], [4, 5, 6, 7]] // two bars
 * @example '0---- 1-- 2--' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats
 * @example '0*4 1*2 2*2' => [[0, 0, 0, 0, 1, 1, 2, 2]] // marking out the beats alternative syntax
 * @example '0?1----' => [[1, 0, 0, 1]] // random choice for four beats
 * @example '0?1?2----' => [[2, 1, 2, 0]] 
 * @example '0>1----' => [[0, 1, 0, 1]] // alternate for four measures
 * @example '0>1>2----' => [[0, 1, 2, 0]]
 * @example '[0,1,2,3]' => [[0, 1, 2, 3]] // array of values, useful for chords
 * @example '[0,1,2,3]?[4,5,6,7]----' => [[4,5,6,7],[4,5,6,7],[0,1,2,3],[0,1,2,3]] // can be used with random choice
 * @example '[0,1,2,3]>[4,5,6,7]----' => [[0,1,2,3],[4,5,6,7],[0,1,2,3],[4,5,6,7]] // can be used with alternate
 * @example '0..2----' => [[0, 1, 2, 0]] // sequence from 0 to 3
 * @example '3..0----' => [[3, 2, 1, 0]] // sequence from 3 to 0
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
        .map(s => !isNaN(+s) ? +s : s)
      )
    }

  bars 
    = bar+

  bar 
    = values:event+ divider? space* { return values; }

  event 
    = sequence / choices / alternatives

  choices 
    = arr:choice+ dur:duration space* { return {val: arr, dur, type: 'choices'}; }

  choice
    = !">" val:value !">" "?"? { return val }

  alternatives
    = arr:alternative+ dur:duration space* { return {val: arr, dur, type: 'alternatives'}; }

  alternative
    = !"?" val:value !"?" ">"? { return val }

  value 
    = $[a-zA-Z0-9@]+ / $number+ / array

  sequence
    = start:$[0-9]+ ".." end:$[0-9]+ type:("?"?) dur:duration space* { 
      let step = +start < +end ? 1 : -1
      let size = Math.abs(+end - +start + step)
      return {
        val: new Array(size).fill(0).map((_, i) => +start + i * step), 
        dur, 
        type: type === '?' ? 'choices' : 'alternatives'
      }
    }
  
  array 
    = "[" val:$(space* v:value space* ","?)+ "]" { return val.split(',').map(s => s.trim()) }

  number 
    = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) { return +text(); }

  duration
    = count:(ticks / tick) { return count || 1 }

  ticks 
    = "*" t:$[0-9]+ { return parseInt(t); }

  tick 
    = "-"* { return text().length; }

  divider 
    = "|"

  space 
    = " "
`);

export const parse = memoize((pattern: string): any[] => parser.parse(pattern))