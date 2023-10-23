import { seedValue } from '../stores'

// TODO: document
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const bts = (bpm: number) => (beats: number) => beats * (60 / bpm);
const btms = (bpm: number) => (beats: number) => beats * (60 / bpm) * 1000;

const seed = (str: string) => {
    seedValue.set(str)
    // seedRandom(str, { global: true })
}

export const helpers = {
    clamp,
    bts,
    btms,
    seed,
    ...Math,
}