import { Noise } from 'noisejs'

export const noise = new Noise(Math.random())

export const max = (a: number, b: number) => a >= b ? a : b
export const min = (a: number, b: number) =>  a <= b ? a : b

export function mapToRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number, step: number = 0.5)  {
    return roundToFactor(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin, step)
}

export function roundToFactor(n: number, factor: number = 1) {
    return factor 
        ? Math.round(n / factor) * factor
        : n
}

export function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max)
}

export function createCount(start = 0){
    let counter = start - 1;
    return function count() {
        counter = counter + 1;
        return counter;
    }
}

export function numberToBinary(n: number, bits: number = 16) {
    return (n >>> 0).toString(2).padStart(bits, '0');
}

export const mod = (n: number, modulo: number) => ((n % modulo) + modulo) % modulo;

// TODO: difficult to type as args are unknown
export const _reduced = (f: () => any, g: () => any) => (...args) => g(f(...args));
export const pipe = (...fns) => fns.reduce(_reduced);

export const beatsToSeconds = (beats: number, bpm: number) => beats * (60 / bpm);