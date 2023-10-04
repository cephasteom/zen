import { memoize } from './utils'
import { scales } from '../data/scales'
import { chords } from '../data/chords'

export function letterToInteger(letter: string) {
    return { 
        cf: -1,
        c: 0, 
        cs: 1, df: 1, 
        d: 2, 
        ds: 3, ef: 3, 
        e: 4, 
        es: 5, f: 5, 
        fs: 6, gf:6, 
        g: 7, 
        gs: 8, af: 8,
        a: 9,
        as: 10, bf: 10,
        b: 11, bs: 12
    }[letter] || 0
}

// note name to midi number
export function ntom(letter: string, octave: number = 4) {
    return letterToInteger(letter) + (+octave * 12)
}

export const getScale = memoize((name: string) => {
    const [root = 'c', scale = 'major'] = name.split("-")
    const notes = scales[scale] || []
    const rootIndex = letterToInteger(root)
    return Array(8).fill(notes)
        .map((notes: number[], octave: number) => notes.map((n: number) => (n + rootIndex + (octave * 12))))
        .flat()
})

export const getChord = memoize((name: string) => {
    const [root = 'c', chord = 'major'] = name.split("-")
    const notes = chords[chord] || []
    const rootIndex = letterToInteger(root)
    return notes.map((n: number) => n + rootIndex)
})

// when passed an array containing 1 octave of a scale, repeat the scale until it reaches the specified length
export function repeatScale(arr: number[], n: number): number[] {
    const repetitions = Math.ceil(n / arr.length);
    return Array(repetitions)
        .fill(arr)
        .map((arr: number[], i: number) => arr.map((n: number) => n + (i * 12)))
        .flat().slice(0, n);
}

// Take a bar of values and return an array of sub-bars, with the original bar stretched to fit the specified number of bars
export function stretchBar(bar: number[], numBars: number): number[][] {
    const beats = bar.length;
    const lcd = beats * numBars;
    const arr = new Array(lcd).fill(0).map((_, i) => bar[Math.floor(i / numBars)]);
    return new Array(numBars).fill(0)
        .map((_, i) => arr.slice(i * beats, (i + 1) * beats));
}