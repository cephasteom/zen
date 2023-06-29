import type { stack } from '../types'
import { mapToRange, roundToFactor, clamp, noise, numberToBinary, min } from '../utils/utils';
import { getScale } from '../utils/musical';

class Pattern {
    private stack: stack = []
    private _value: number | null = null
    private _q: number = 16 // divisions per cycle
    private _bpm: number = 120

    constructor(value: number | null = null) {
        value !== null && this.set(value);
        this._value = value;
        
        // Add all Math functions to the Parameter class
        Object.getOwnPropertyNames( Math ).map( name => {
            this[name] = (...args: number[]) => {
                this.stack = [...this.stack, (x: number) => Math[name](x, ...args)]
                return this
            }
        });
    }

    set(value: number) {
        this.stack = [() => value] 
        return this
    }

    reset() {
        this.stack = []
        this._value && this.set(this._value)
        return this
    }

    // use params from another stream, e.g. s1.p('foo').use(s0.p.bar).add(2)
    use(pattern: Pattern) {
      this.stack = [...this.stack, ...pattern.stack]
      return this
    }

    // step quantised the output, freq is the number of iterations of the range, either per cycle or per canvas
    // values provided to the callback should be in num of cycles or num of canvas
    range(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => mapToRange(((t/this._q)*freq)%1, 0, 1, lo, hi, step)]
        return this
    }

    seq(values: number[] = [], freq: number = 1) {
        this.stack = [...this.stack, (t: number) => values[Math.floor(((t/this._q)*freq*values.length)%values.length)]]
        return this
    }

    // sine function
    sine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            const radians = (((t/this._q)*freq)%1) * 360 * (Math.PI/180)
            const sin = Math.sin(radians)

            return mapToRange(sin, -1, 1, lo, hi, step)
        }]
        return this
    }

    // cosine function
    cosine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            const radians = (((t/this._q)*freq)%1) * 360 * (Math.PI/180)
            const cos = Math.cos(radians)

            return mapToRange(cos, -1, 1, lo, hi, step)
        }]
        return this
    }

    // sawtooth function
    saw(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            const saw = (((t/this._q)*freq)%1)

            return mapToRange(saw, 0, 1, lo, hi, step)
        }]
        return this
    }

    // triangle function
    tri(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            const tri = Math.abs((((t/this._q)*freq)%1) - 0.5) * 2

            return mapToRange(tri, 0, 1, lo, hi, step)
        }]
        return this
    }

    // square function
    square(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            const square = (((t/this._q)*freq)%1) < 0.5 ? 0 : 1

            return mapToRange(square, 0, 1, lo, hi, step)
        }]
        return this
    }

    // random function
    random(lo: number = 0, hi: number = 1, step: number = 0) {
        this.stack = [() => mapToRange(Math.random(), 0, 1, lo, hi, step)]
        return this
    }

    // noise function
    noise(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1) {
        this.stack = [...this.stack, (t: number) => {
            return mapToRange(noise.simplex2((t/this._q)*freq,0), -1, 1, lo, hi, step)
        }]
        return this
    }

    // Chained functions
    add(value: number = 0) {
        this.stack = [...this.stack, x => x + value]
        return this
    }

    take(value: number = 0) {
        this.stack = [...this.stack, x => x - value]
        return this
    }

    // reverse take value - x, rather than x - value
    $take(value: number = 0) {
        this.stack = [...this.stack, x => value - x]
        return this
    }

    mul(value: number = 1) {
        this.stack = [...this.stack, x => x * value]
        return this
    }

    div(value: number = 1) {
        this.stack = [...this.stack, x => x / value]
        return this
    }

    // reverse div value - x, rather than x / value
    $div(value: number = 1) {
        this.stack = [...this.stack, x => value / x]
        return this
    }

    mod(value: number = 1) {
        this.stack = [...this.stack, x => ((x % value) + value) % value]
        return this
    }

    step(value: number) {
        this.stack = [...this.stack, x => roundToFactor(x, value)]
        return this
    }

    clamp(min: number, max: number) {
        this.stack = [...this.stack, x => clamp(x, min, max)]
        return this
    }

    // greater than - returns a if true, b if false
    gt(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x > n ? a : b]
        return this
    }

    // less than - returns a if true, b if false
    lt(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x < n ? a : b]
        return this
    }

    // greater than or equal to - returns a if true, b if false
    gte(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x >= n ? a : b]
        return this
    }

    // less than or equal to - returns a if true, b if false
    lte(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x <= n ? a : b]
        return this
    }

    // equal to - returns a if true, b if false
    eq(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x === n ? a : b]
        return this
    }

    // not equal to - returns a if true, b if false
    neq(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x !== n ? a : b]
        return this
    }

    odd(a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x % 2 === 1 ? a : b]
        return this
    }

    even(a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x % 2 === 0 ? a : b]
        return this
    }

    if(a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => x ? a : b]
        return this
    }

    // return a every cycle * n, otherwise return b. 
    // E.g. every(4) will return 1 every 4 cycles, every(0.5) will return 1 every 0.5 cycles 
    // also useful to write it e.g. every(1/q), every(7/q)
    // less effective when q uses compound time signatures TODO: fix this
    every(n: number, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => !(x % n) ? a : b]
        return this
    }

    // convert a number to binary and return a or b based on the true/false value at the current position in the string
    ntbin(n: number = 8, q: number = 16, a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => {
            const arr = numberToBinary(n, q).split('')
            return !!parseInt(arr[Math.floor((x%1)*arr.length)]) ? a : b
        }]
    }

    bin(n: string = '10000000', a: number = 1, b: number = 0) {
        this.stack = [...this.stack, x => {
            const arr = n.split('')
            return !!parseInt(arr[Math.floor((x%1)*arr.length)]) ? a : b
        }]
    }

    /**
     * convert current value from beats to seconds, scaling by bpm
     * @returns 
     */
    bts() {
        this.stack = [...this.stack, x => x * (60/this._bpm)]
        return this
    }

    // convert current value from beats to milliseconds, scaling by bpm
    btms() {
        this.stack = [...this.stack, x => x * (60000/this._bpm)]
        return this
    }

    // do whatever to the preceding value
    fn(cb: {(x: number): number}) {
        this.stack = [...this.stack, cb]
        return this
    }

    scale(name: string, length: number = 8) {
        const scale = getScale(name)
        const size = min(length, scale.length)
        this.stack = [...this.stack, x => scale[Math.floor(x)%size]]
        return this
    }

    // Get output based on position in cycle or on canvas
    // expected to be normalised between 0 - 1
    get(t: number, q: number, bpm?: number) {
        this._q = q
        this._bpm = bpm || this._bpm

        return this.stack.length ? this.stack.reduce((val, fn) => fn(val), t) : null
    }

    has() : boolean {
        return !!this.stack.length
    }
}

export default Pattern