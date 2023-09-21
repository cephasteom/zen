import { Noise } from 'noisejs'
import type { patternValue, Dictionary } from '../types'
import { Pattern } from '../classes/Pattern'
import { parsePattern } from '../parser'

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
    return (n >>> 0).toString(2).padEnd(bits, '0');
}

export const mod = (n: number, modulo: number) => ((n % modulo) + modulo) % modulo;

// @ts-ignore
export const _reduced = (f: () => any, g: () => any) => (...values) => g(f(...values));
// @ts-ignore
export const pipe = (...fns) => fns.reduce(_reduced);

export const beatsToSeconds = (beats: number, bpm: number) => beats * (60 / bpm);

export const wrap = (i: number, max: number) => i % max

// memoize single argument function
export function memoize(fn: (x: any) => any) {
    let cache: Dictionary = {};
    return (value: any) => {
        let n = value;
        return n in cache 
            ? cache[n]
            : (cache[n] = fn(n));
        }
}

export function handleArrayOrSingleValue(value: patternValue, fn: (x: number) => number) {
    return Array.isArray(value)
        ? singleValueArrayToSingleValue(value.map(fn))
        : fn(value)
}

export function singleValueArrayToSingleValue(value: patternValue): patternValue {
    Array.isArray(value) && value.length === 1 && ( value = value[0] );
    return value
}

/**
 * 
 * @param x value to be normalised
 * @param q divisions of the normalised range
 * @param freq frequency of the normalised range
 * @returns 
 */
export function calculateNormalisedPosition(x: patternValue, q: number, freq: number, mod: number = 1) {
    const val = Array.isArray(x) ? x[0] : x // ensure x is a number
    return ((+val / q) * freq) % mod
}

export function isArray(value: any) {
    return Array.isArray(value)
}

export function isString(value: any) {
    return typeof value === 'string'
}

export function add(a: number, b: number) {
    return a + b
}

export function sub(a: number, b: number) {
    return a - b
}

export function mul(a: number, b: number) {
    return a * b
}

export function div(a: number, b: number) {
    return a / b
}

export function odd(n: number) {
    return n % 2 === 1
}

export function even(n: number) {
    return n % 2 === 0
}

export function roundToNearest(n: number, arr: number[]) {
    return arr.reduce((a, b) => {
        return Math.abs(b - n) < Math.abs(a - n) ? b : a
    })
}

export function interpolate(a: number, b: number, t: number) {
    return a + (b - a) * t
}

export function handleTypes(value: patternValue | Pattern | string, t: number, q: number) {
    if(value instanceof Pattern) return value.value()
    if(typeof value === 'string') return parsePattern(value, t, q)
    return value
}