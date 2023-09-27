import peg from 'pegjs';
import { 
    memoize,
    calculateNormalisedPosition as pos,
    loopArray,
} from '../utils/utils'
import { ntom } from '../utils/musical'
import { euclidean } from './euclidean-rhythms'

// Add functions to window for so that it can be accessed by parser syntax
[euclidean, loopArray, ntom].forEach((fn: any) => window[fn.name] = fn)

// TODO: test tasks using jest
// TODO: Rewrite Zen so it can handle notes that fall between the evaluations...
// TODO: scales/modes clydian. Be able to return entire scale/mode by wrapping in []
// TODO: s2.v({in:1,ba:'gmsine',v:1}) not working - clash between note, chords and strings...

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
* @example '4:16' => [[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]] // euclidean rhythm
* @example '3:8*2' => [[1, 0, 0, 1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]] // euclidean rhythm
* @example 'D4 E4 F#4 G4 A4 B4 C#5 D5' => [[62, 64, 66, 67, 69, 71, 73, 74]] // notes - always use capital letters for notes to distinguish them from sample names
* @example 'Cmaj7' => [[60, 64, 67, 71]] // chords - root,type (maj,min,dim,aug),extension (7,#7,b9,9). Again, always capitalise the root note
* @example '(1 0*3)*4' => [[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]] // group any of the above together, specify how many times the group should repeat in its entirety
* @example '1 1 1?0--; b:8' // set the amount of bars generated to 8. Default is 1 or length of your pattern.
*/

const parser = peg.generate(`
    // PARSING
    result 
        = bs:bars args:args? {
            const format = ({val, dur, type, repeats}) => {
                if (type === 'group') return new Array(repeats).fill(0).map(() => val.map(format).flat()).flat()
                if (type === 'choices') return new Array(dur).fill(0).map(() => val[Math.floor(Math.random() * val.length)])
                if (type === 'alternatives') return new Array(dur).fill(0).map((_, i) => val[i % val.length])
                if (type === 'single') return new Array(dur).fill(0).map(() => val)
                
                return event.val
            }

            const patternLength = args?.bars || bs.length || 1

            return loopArray(bs, patternLength).map(bar => bar
                .map(format).flat()
                .map(s => Array.isArray(s) ? s.map(s => !isNaN(+s) ? +s : s) : !isNaN(+s) ? +s : s)
            )
    }
    
    // GROUPING
    group
        = "(" space* val:event+ space* ")" repeats:duration? space* { return {val, repeats: repeats || 1, type: 'group'}; }

    // COMPLEX TYPES
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
            const val = euclidean(+pulses, +steps).map(v => ({val: v, dur: 1, type: 'single'}))
            return {
                val,
                repeats: dur || 1,
                type: 'group'
            }
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
    
    // TIME
    duration
        = count:(ticks / tick) { return count }

    ticks 
        = "*" t:$[0-9]+ { return parseInt(t); }

    tick 
        = "-"* { return text().length; }

    // HARMONY
    absolute_chord = base:note chord:chord_extended {
        var result = [];
        for (var e of chord) {
            result.push(base + e);
        }
        return result;
    }
    
    chord_extended = chord:chord variants:chord_variant* {
        var last = chord[2];
        for (var v of variants) {
            chord.push(last + v);
        }
        return chord;
    }
    
    chord_variant 
        = "7" { return 3; }
        / "#7" { return 4; }
        / "b9" { return 6; }
        / "9" { return 7; }
    
    chord
        = "min" { return [0, 3, 7]; }
        / "maj" { return [0, 4, 7]; }
        / "dim" { return [0, 3, 6]; }
        / "sus" { return [0, 5, 7]; } 
        / "aug" { return [0, 4, 8]; }
    
    note = c:chroma a1:accidental a2:accidental o:octave { return c + a1 + a2 + o; }
    
    // notes/chords roots are always capitalised, to distinguish them from sample names
    chroma = c:[A-G] { 
        // return MIDI note offset from C:
        switch(c) {
            case "C": return 0; 
            case "D": return 2; 
            case "E": return 4; 
            case "F": return 5; 
            case "G": return 7; 
            case "A": return 9; 
            case "B": return 11; 
        }
    }
    
    // sharps and flats
    accidental = a:[#b]? {
        // return MIDI note offset:
        switch(a) {
            case "#": return +1;
            case "b": return -1;
            default: return 0;
        }
    }
    
    octave = n:$("-"? [0-9]+)? { 
        return n 
            ? 12 + (+n) * 12
            : 60; // default to middle C
    }

    // BASIC TYPES
    args
        = space* ";"? space* bars:("b:" number)? space* ";"? space* { return {bars: bars && (bars[1])}; }

    bars 
        = bar+
    
    bar 
        = space* values:(group+ / event+) divider? space* { return values; }
            
    value 
        = absolute_chord / note / string / $number+ / array 

    array 
        = "[" val:$(space* v:value space* ","?)+ "]" { return val.split(',').map(s => s.trim()) }

    number 
        = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) { return +text(); }

    string
        = [a-zA-Z0-9@]+ { return text(); }
        
    // SYMBOLS
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

export const parsePattern = (pattern: string, t: number, q: number, id: string, round=true) => {
    const array = parse(pattern, id)
    let position = pos(t, q, 1, array.length)
    let bar = Math.trunc(position)
    let beat = (position % 1) * array[bar].length
    // if round is true, round the beat down to the nearest integer so that it always returns a value
    // if round is false, return the value at the exact beat, or return a 0
    beat = round ? Math.floor(beat) : beat
    return array[bar][beat] || 0
}