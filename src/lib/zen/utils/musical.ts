import { memoize } from './utils'
import { scales } from '../data/scales'
import { chords } from '../data/chords'

export function letterToInteger(letter: string) {
    return { 
        c: 0, 
        cs: 1, df: 1, 
        d: 2, 
        ds: 3, ef: 3, 
        e: 4,
        f: 5, 
        fs: 6, gf:6, 
        g: 7, 
        gs: 8, af: 8,
        a: 9,
        as: 10, bf: 10,
        b: 11
    }[letter] || 0
}

export const getScale = memoize((name: string) => {
    const [root = 'c', scale = 'major'] = name.split("-")
    const notes = scales[scale]
    const rootIndex = letterToInteger(root)
    return Array(8).fill(notes)
        .map((notes: number[], octave: number) => notes.map((n: number) => (n + rootIndex + (octave * 12))))
        .flat()
})

export const getChord = memoize((name: string) => {
    const [root = 'c', chord = 'major'] = name.split("-")
    const notes = chords[chord]
    const rootIndex = letterToInteger(root)
    return notes.map((n: number) => n + rootIndex)
})