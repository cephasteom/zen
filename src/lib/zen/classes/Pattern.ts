import type { stack, patternValue } from '../types'
import { 
    mapToRange, 
    roundToFactor, 
    clamp, 
    noise, 
    numberToBinary, 
    min, 
    calculateNormalisedPosition as pos, 
    odd, 
    even,
    handleArrayOrSingleValue as handle,
} from '../utils/utils';
import { getScale, getChord } from '../utils/musical';

/**
 * Pattern class
 */
export class Pattern {
    private _value: patternValue = 0
    private stack: stack = []
    private _q: number = 16 // divisions per cycle
    private _bpm: number = 120

    /**
     * Set a single value
     * @param {patternValue} value - a single string or number or array of strings or numbers
     * @returns {Pattern}
     * @example s0.p.amp.set(1)
     */
    set(value: patternValue): Pattern {
        this.stack = [() => value] 
        return this
    }
    
    /** @hidden */
    reset() {
        this.stack = []
        this._value = 0
        return this
    }

    /**
     * Use another pattern's stack
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.p.amp.use(s1.p.amp)
    s1.p.amp.eval(s0.p.amp).mul(2);
     */
    use(pattern: Pattern): Pattern {
        this.stack.push(...pattern.stack)
        return this
    }

    /**
     * Get the current value of another pattern
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.e.odd()
    s1.e.eval(s0.e).neq(1)
     */
    eval(pattern: Pattern): Pattern {
        this.stack.push(() => pattern._value)
        return this
    }

    /**
     * Generate a range of values between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.range(0, 10, 1, 2)
     */
    range(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => mapToRange(pos(x, this._q, freq), 0, 1, lo, hi, step))
        return this
    }

    /**
     * Generate a sine wave between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.sine(0, 10)
     */
    sine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => {
            const radians = pos(x, this._q, freq) * 360 * (Math.PI/180)
            const sin = Math.sin(radians)
            return mapToRange(sin, -1, 1, lo, hi, step)
        })
        return this
    }

    
    /**
     * Generate a cosine wave between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.cosine(0, 10)
     */
    cosine(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) =>  {
            const radians = pos(x, this._q, freq) * 360 * (Math.PI/180)
            const cos = Math.cos(radians)
            return mapToRange(cos, -1, 1, lo, hi, step)
        })
        return this
    }

    /**
     * Generate a saw wave between lo and hi. Alias of range. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.saw(0, 10)
     */
    saw(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        return this.range(lo, hi, step, freq)
    }
    
    /**
     * Generate a triangle wave between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.harm.tri(0, 4, 0.25)
     */
    tri(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => {
            const tri = Math.abs(pos(x, this._q, freq) - 0.5) * 2
            return mapToRange(tri, 0, 0.5, lo, hi, step)
        })
        return this
    }

    /**
     * Generate a pulse wave between lo and hi. Use as the first call in a pattern chain.
     * @param lo - lowest value in range
     * @param hi - highest value in range
     * @param width - width of the pulse. Default is 0.5, which means a square wave.
     * @param freq - number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.pulse(0, 10, 0.25)
    */
    pulse(lo: number = 0, hi: number = 1, width: number = 0.5, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => {
            const pulse = (((pos(x, this._q, freq))%1) < width ? 1 : 0)
            return mapToRange(pulse, 0, 1, lo, hi)
        })
        return this
    }

    /**
     * Generate a square wave between lo and hi. Use as the first call in a pattern chain. See also pulse.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.square(0, 10)
    */
    square(lo: number = 0, hi: number = 1, freq: number = 1): Pattern {
        this.pulse(lo, hi, 0.5, freq)
        return this
    }

    /**
     * Generate a random number between lo and hi.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @returns {Pattern}
     * @example s0.p.n.random(60,72,1)
     */
    random(lo: number = 0, hi: number = 1, step: number = 0): Pattern {
        this.stack = [() => mapToRange(Math.random(), 0, 1, lo, hi, step)]
        return this
    }

    /**
     * Generate a number between lo and hi, using a simplex noise function.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.pan.noise(0, 1)
    */
    noise(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack = [(x: patternValue) => {
            return mapToRange(noise.simplex2(pos(x, this._q, freq), 0), -1, 1, lo, hi, step)
        }]
        return this
    }

    /**
     * Generate truthy or falsy values every n divisions.
     * @param n number of divisions
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.e.every(4) // return 1 every 4 divisions, 0 otherwise
     * @example s0.p.n.every(2, 60, 72) // return 60 every 2 divisions, 72 otherwise
     */
    every(n: number, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => !(+x % n) ? a : b)
        return this
    }

    /**
     * Generate truthy or falsy values from a binary string.
     * @param n binary string
     * @param freq number of iterations of the range, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.bin('1111') // output depends on the number of division per cycle / canvas. If 16, returns 1 every 4 divisions, 0 otherwise
    */
    bin(n: string = '10000000', freq: number = 1, a: number = 1, b: number = 0): Pattern {
        const arr = n.replace(/\s+/g, '').split('').map(x => !!parseInt(x))
        const divisions = this._q / freq
        this.stack = [(x: patternValue) => {
            // return arr[+x%arr.length] ? a : b
            return arr[ (+x%divisions) / (divisions/arr.length) ] ? a : b
        }]
        return this
    }

    /**
     * Convert a number to binary string, then passes it to .bin().
     * @param n a number
     * @param q the length of the binary string
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.ntbin(9, 8) // 9 in binary is 1001, padded out to 8 digits. Passes 00001001 to .bin()
     */
    ntbin(n: number = 8, q: number = 16, a: number = 1, b: number = 0): Pattern {
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

        // this._value = 
        const value = this.stack.length 
            ? this.stack.reduce((val: patternValue, fn) => fn(val), t) 
            : null

        this._value = value || 0
        return value
    }

    has() : boolean {
        return !!this.stack.length
    }
}