// TODO: document
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const bts = (bpm: number) => (beats: number) => beats * (60 / bpm);
const btms = (bpm: number) => (beats: number) => beats * (60 / bpm) * 1000;

export const helpers = {
    clamp,
    bts,
    btms,
    ...Math
}