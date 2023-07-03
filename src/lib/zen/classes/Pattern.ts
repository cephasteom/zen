import type { stack, patternValue } from '../types'
import { 
    mapToRange, roundToFactor, clamp, noise, numberToBinary, min, calculateNormalisedPosition as pos, isArray,
    add, sub, mul, div, odd, even
} from '../utils/utils';
import { getScale, getChord } from '../utils/musical';

class Pattern {
    private stack: stack = []
    private _q: number = 16 // divisions per cycle
    private _bpm: number = 120

    constructor() {
        // Add all Math functions to the Parameter class
        // TODO: handling ranges
        Object.getOwnPropertyNames( Math ).map( name => {
            this[name] = (...args: number[]) => {
                this.stack.push((x: patternValue) => Math[name](+x, ...args))
                return this
            }
        });
    }

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
        this.stack = [(x: patternValue) => mapToRange(pos(+x, this._q, freq), 0, 1, lo, hi, step)]
        return this
    }

    // sine function
    sine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [
            (x: patternValue) => {
                const radians = pos(+x, this._q, freq) * 360 * (Math.PI/180)
                const sin = Math.sin(radians)
                return mapToRange(sin, -1, 1, lo, hi, step)
            }
        ]
        return this
    }

    // cosine function
    cosine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [
            (x: patternValue) =>  {
                const radians = pos(+x, this._q, freq) * 360 * (Math.PI/180)
                const cos = Math.cos(radians)
                return mapToRange(cos, -1, 1, lo, hi, step)
            }
        ]
        return this
    }

    // sawtooth function
    saw(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [
            (x: patternValue) => {
                const saw = pos(+x, this._q, freq)
                return mapToRange(saw, 0, 1, lo, hi, step)
            }
        ]
        return this
    }
    
    // triangle function
    tri(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [
            (x: patternValue) => {
                const tri = Math.abs(pos(+x, this._q, freq) - 0.5) * 2
                return mapToRange(tri, 0, 0.5, lo, hi, step)
            }
        ]
        return this
    }

    // pulse function
    pulse(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1, width: number = 0.5) {
        this.stack = [
            (x: patternValue) => {
                const pulse = (((pos(+x, this._q, freq))%1) < width ? 1 : 0)
                return mapToRange(pulse, 0, 1, lo, hi, step)
            }
        ]
        return this
    }

    // square function
    square(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.pulse(lo, hi, step, freq, 0.5)
        return this
    }

    // random function
    random(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [() => mapToRange(Math.random(), 0, 1, lo, hi, step)]
        return this
    }

    // noise function
    noise(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [(x: patternValue) => {
            return mapToRange(noise.simplex2(pos(+x, this._q, freq), 0), -1, 1, lo, hi, step)
        }]
        return this
    }

    // generate on / off values every x steps
    every(n: number, a: number = 1, b: number = 0) {
        this.stack.push(x => !(+x % n) ? a : b)
        return this
    }

    bin(n: string = '10000000', a: number = 1, b: number = 0) {
        this.stack = [x => {
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
        this.stack.push((x: patternValue) => values[Math.floor((pos(+x, this._q, freq)*values.length)%values.length)])
        return this
    }
    
    add(value: number = 0) {
        this.stack.push(x => [x].flat().map(x => x + value))
        return this
    }

    take(value: number = 0) {
        this.stack.push(x => [x].flat().map(x => value - x))
        return this
    }

    // reverse take value - x, rather than x - value
    $take(value: number = 0) {
        this.stack.push(x => [x].flat().map(x => value - x))
        return this
    }

    mul(value: number = 1) {
        this.stack.push(x => [x].flat().map(x => x * value))
        return this
    }

    div(value: number = 1) {
        this.stack.push(x => [x].flat().map(x => x / value))
        return this
    }

    // reverse div value - x, rather than x / value
    $div(value: number = 1) {
        this.stack.push(x => [x].flat().map(x => value / x))
        return this
    }

    mod(value: number = 1) {
        this.stack.push(x => [x].flat().map(x => ((x % value) + value) % value))
        return this
    }

    step(value: number) {
        this.stack.push(x => [x].flat().map(x => roundToFactor(x, value)))
        return this
    }

    clamp(min: number, max: number) {
        this.stack.push(x => [x].flat().map(x => clamp(x, min, max)))
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

    /**
     * convert current value(s) from beats to seconds, scaling by bpm
     * @returns 
     */
    bts() {
        this.stack.push(x => [x].flat().map(x => x * (60/this._bpm)))
        return this
    }

    // convert current value from beats to milliseconds, scaling by bpm
    btms() {
        this.stack.push(x => [x].flat().map(x => x * (60000/this._bpm)))
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
        const sequence = scales.flat()
        this.seq(sequence, freq).add(48)
        return this
    }

    chords(names: string | string[], freq: number = 1) {
        const chords = [names].flat().map(name => {
            const chord = getChord(name)
            return chord
        })

        this.seq(chords, freq).add(48)
        return this
    }

    // Get output based on position in cycle or on canvas
    get(t: number, q: number, bpm?: number) {
        this._q = q
        this._bpm = bpm || this._bpm

        return this.stack.length 
            ? [
                ...this.stack,
                (x: any) => isArray(x) && x.length === 1 ? x[0] : x
            ].reduce((val, fn) => fn(val), t) 
            : null
    }

    has() : boolean {
        return !!this.stack.length
    }
}

export default Pattern