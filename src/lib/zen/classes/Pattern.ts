// TODO: conditionals for arrays...

import type { stack, patternValue } from '../types'
import { 
    mapToRange, 
    roundToFactor, 
    clamp, 
    noise, 
    numberToBinary, 
    min, 
    calculateNormalisedPosition as pos, 
    isArray,
    odd, 
    even,
    handleArrayOrSingleValue as handle,
} from '../utils/utils';
import { getScale, getChord } from '../utils/musical';

class Pattern {
    private stack: stack = []
    private _q: number = 16 // divisions per cycle
    private _bpm: number = 120

    set(value: patternValue) {
        this.stack = [() => value] 
        return this
    }

    reset() {
        this.stack = []
        return this
    }

    // use params from another stream, e.g. s1.p('foo').use(s0.p.bar).add(2)
    use(pattern: Pattern) {
        this.stack.push(...pattern.stack)
        return this
    }

    // step quantised the output, freq is the number of iterations of the range, either per cycle or per canvas
    // values provided to the callback should be in num of cycles or num of canvas
    range(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack.push((x: patternValue) => mapToRange(pos(x, this._q, freq), 0, 1, lo, hi, step))
        return this
    }

    // sine function
    sine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack.push((x: patternValue) => {
            const radians = pos(x, this._q, freq) * 360 * (Math.PI/180)
            const sin = Math.sin(radians)
            return mapToRange(sin, -1, 1, lo, hi, step)
        })
        return this
    }

    // cosine function
    cosine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack.push((x: patternValue) =>  {
            const radians = pos(x, this._q, freq) * 360 * (Math.PI/180)
            const cos = Math.cos(radians)
            return mapToRange(cos, -1, 1, lo, hi, step)
        })
        return this
    }

    // sawtooth function
    saw(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack.push((x: patternValue) => {
            const saw = pos(x, this._q, freq)
            return mapToRange(saw, 0, 1, lo, hi, step)
        })
        return this
    }
    
    // triangle function
    tri(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack.push((x: patternValue) => {
            const tri = Math.abs(pos(x, this._q, freq) - 0.5) * 2
            return mapToRange(tri, 0, 0.5, lo, hi, step)
        })
        return this
    }

    // pulse function
    pulse(lo: number = 0, hi: number = 1, width: number = 0.5, freq: number = 1) {
        this.stack.push((x: patternValue) => {
            const pulse = (((pos(x, this._q, freq))%1) < width ? 1 : 0)
            return mapToRange(pulse, 0, 1, lo, hi)
        })
        return this
    }

    // square function
    square(lo: number = 0, hi: number = 1, freq: number = 1) {
        this.pulse(lo, hi, 0.5, freq)
        return this
    }

    // random function
    random(lo: number = 0, hi: number = 1, step: number = 0) {
        this.stack = [() => mapToRange(Math.random(), 0, 1, lo, hi, step)]
        return this
    }

    // noise function
    noise(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [(x: patternValue) => {
            return mapToRange(noise.simplex2(pos(x, this._q, freq), 0), -1, 1, lo, hi, step)
        }]
        return this
    }

    // generate on / off values every x steps
    every(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => !(+x % n) ? a : b)
        return this
    }

    // generate patterns from binary strings
    bin(n: string = '10000000', a: number = 1, b: number = 0) {
        this.stack = [(x: patternValue) => {
            const arr = n.split('')
            return !!parseInt(arr[Math.floor((+x%1)*arr.length)]) ? a : b
        }]
        return this
    }

    // convert a number to binary string and return a or b based on the true/false value at the current position in the string
    ntbin(n: number = 8, q: number = 16, a: number = 1, b: number = 0) {
        return this.bin(numberToBinary(+n, q), a, b)
    }

    // Chained functions - should be able to handle arrays
    seq(values: number[] = [], freq: number = 1) {
        this.stack.push((x: patternValue) => values[Math.floor((pos(x, this._q, freq)*values.length)%values.length)])
        return this
    }
    
    add(value: number = 0) {
        this.stack.push(x => handle(x, x => x + value))
        return this
    }

    take(value: number = 0) {
        this.stack.push(x => handle(x, x => value - x))
        return this
    }

    // reverse take value - x, rather than x - value
    $take(value: number = 0) {
        this.stack.push(x => handle(x, x => value - x))
        return this
    }

    mul(value: number = 1) {
        this.stack.push(x => handle(x, x => x * value))
        return this
    }

    div(value: number = 1) {
        this.stack.push(x => handle(x, x => x / value))
        return this
    }

    // reverse div value - x, rather than x / value
    $div(value: number = 1) {
        this.stack.push(x => handle(x, x => value / x))
        return this
    }

    mod(value: number = 1) {
        this.stack.push(x => handle(x, x => ((x % value) + value) % value))
        return this
    }

    step(value: number) {
        this.stack.push(x => handle(x, x => roundToFactor(x, value)))
        return this
    }

    clamp(min: number, max: number) {
        this.stack.push(x => handle(x, x => clamp(x, min, max)))
        return this
    }

    // greater than - returns a if true, b if false
    gt(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x > n) ? a : b)
        return this
    }

    // less than - returns a if true, b if false
    lt(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x < n) ? a : b)
        return this
    }

    // greater than or equal to - returns a if true, b if false
    gte(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x >= n) ? a : b)
        return this
    }

    // less than or equal to - returns a if true, b if false
    lte(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x <= n) ? a : b)
        return this
    }

    // equal to - returns a if true, b if false
    eq(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x === n) ? a : b)
        return this
    }

    // not equal to - returns a if true, b if false
    neq(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => x !== n) ? a : b)
        return this
    }

    odd(a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(odd) ? a : b)
        return this
    }

    even(a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(even) ? a : b)
        return this
    }

    if(a: number = 1, b: number = 0) {
        this.stack.push(x => [x].flat().every(x => !!x) ? a : b)
        return this
    }

    
    // convert current value(s) from beats to seconds, scaling by bpm
    bts() {
        this.stack.push(x => handle(x, x => x * (60/this._bpm)))
        return this
    }

    // convert current value from beats to milliseconds, scaling by bpm
    btms() {
        this.stack.push(x => handle(x, x => x * (60000/this._bpm)))
        return this
    }

    // do whatever to the preceding value
    fn(cb: {(x: patternValue): patternValue}) {
        this.stack.push(cb)
        return this
    }

    scales(names: string | string[], length: number = 8, freq: number = 1) {
        const scales = [names].flat().map(name => {
            const scale = getScale(name)
            return scale.slice(0, min(length, scale.length))
        })
        this.seq(scales.flat(), freq).add(48)
        return this
    }

    chords(names: string | string[], freq: number = 1) {
        this.seq([names].flat().map(name => getChord(name)), freq).add(48)
        return this
    }

    // Math
    sin() {
        this.stack.push((x: patternValue) => handle(x, x => Math.sin(+x))) 
        return this
    }

    cos() {
        this.stack.push((x: patternValue) => handle(x, x => Math.cos(+x)))
        return this
    }

    tan() {
        this.stack.push((x: patternValue) => handle(x, x => Math.tan(+x)))
        return this
    }

    asin() {
        this.stack.push((x: patternValue) => handle(x, x => Math.asin(+x)))
        return this
    }

    acos() {
        this.stack.push((x: patternValue) => handle(x, x => Math.acos(+x)))
        return this
    }

    atan() {
        this.stack.push((x: patternValue) => handle(x, x => Math.atan(+x)))
        return this
    }

    atan2(y: number) {
        this.stack.push((x: patternValue) => handle(x, x => Math.atan2(+x, y)))
        return this
    }

    abs() {
        this.stack.push((x: patternValue) => handle(x, x => Math.abs(+x)))
        return this
    }

    ceil() {
        this.stack.push((x: patternValue) => handle(x, x => Math.ceil(+x)))
        return this
    }

    floor() {
        this.stack.push((x: patternValue) => handle(x, x => Math.floor(+x)))
        return this
    }

    round() {
        this.stack.push((x: patternValue) => handle(x, x => Math.round(+x)))
        return this
    }

    exp() {
        this.stack.push((x: patternValue) => handle(x, x => Math.exp(+x)))
        return this
    }

    log() {
        this.stack.push((x: patternValue) => handle(x, x => Math.log(+x)))
        return this
    }

    max(compare: number = 0) {
        this.stack.push((x: patternValue) => handle(x, x => Math.max(+x, compare)))
        return this
    }

    min(compare: number = 0) {
        this.stack.push((x: patternValue) => handle(x, x => Math.min(+x, compare)))
        return this
    }

    pow(exponent: number = 2) {
        this.stack.push((x: patternValue) => handle(x, x => Math.pow(+x, exponent)))
        return this
    }

    sqrt() {
        this.stack.push((x: patternValue) => handle(x, x => Math.sqrt(+x)))
        return this
    }

    // Trig
    deg() {
        this.stack.push((x: patternValue) => handle(x, x => x * 180 / Math.PI))
        return this
    }

    rad() {
        this.stack.push((x: patternValue) => handle(x, x => x * Math.PI / 180))

        return this
    }   

    // Get output based on position in cycle or on canvas
    get(t: number, q: number, bpm?: number) {
        this._q = q
        this._bpm = bpm || this._bpm

        return this.stack.length 
            // @ts-ignore
            ? this.stack.reduce((val, fn) => fn(val), t) 
            : null
    }

    has() : boolean {
        return !!this.stack.length
    }
}

export default Pattern