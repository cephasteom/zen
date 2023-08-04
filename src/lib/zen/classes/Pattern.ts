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
 * Patterns are the building blocks of Zen. They are used to generate patterns of values in interesting, concise ways. The first value passed to a pattern is either time `t` or a position in space `x`, `y`, or `z`, depending on whether the pattern is assigned to a stream's `p`, `px`, `py`, or `pz` property. Patterns methods can be chained together applying each new method to the value passed from the previous one in the chain.
 * @example
 * s0.p.amp.range(0,1)
 * s0.px.drive.sine(0,1)
 * s0.py.modi.range(0,10).mul((t%q)/q)
 */
export class Pattern {
    /**
     * The value of the pattern after get() has been called
     * Enables use of pattern value in other patterns, using e.g. s1.e.eval(s0.e)
     * @hidden
     */
    private _value: patternValue = 0
    /** @hidden */
    private stack: stack = []
    /** @hidden */
    private _q: number = 16 // divisions per cycle
    /** @hidden */
    private _bpm: number = 120

    // Logic
    /** @hidden */
    _and: null | Pattern = null;
    /** @hidden */
    _or: null | Pattern = null;
    /** @hidden */
    _xor: null | Pattern = null;

    // Maths
    /** @hidden */
    _add: null | Pattern = null;
    /** @hidden */
    _sub: null | Pattern = null;
    /** @hidden */
    _mul: null | Pattern = null;
    /** @hidden */
    _div: null | Pattern = null;

    // State
    /** @hidden */
    _state: any
    /** @hidden */
    _toggle: boolean = false

    /** @hidden */
    constructor() {
        this.reset()
    }

    /**
     * Initialise a new pattern and compare it with the previous chain
     * @returns {Pattern}
     * @example s0.e.every(3).AND.every(2)
     */ 
    get AND(): Pattern {
        !this._and && (this._and = new Pattern())
        return this._and
    }

    /**
     * Initialise a new pattern and compare it with the previous chain
     * @returns {Pattern}
     * @example s0.e.every(3).OR.every(2)
     */
    get OR(): Pattern {
        !this._or && (this._or = new Pattern())
        return this._or
    }

    /**
     * Initialise a new pattern and compare it with the previous chain
     * @returns {Pattern}
     * @example s0.e.every(3).XOR.every(2)
     */
    get XOR(): Pattern {
        !this._xor && (this._xor = new Pattern())
        return this._xor
    } 

    /**
     * Initialise a new pattern and add it to the previous chain
     * @returns {Pattern}
     * @example s0.px.n.range(0,16).ADD.noise(0,16,1)
     */ 
    get ADD(): Pattern {
        !this._add && (this._add = new Pattern())
        return this._add
    } 

    /**
     * Initialise a new pattern and subtract it from the previous chain
     * @returns {Pattern}
     * @example s0.px.n.range(0,16).SUB.noise(0,16,1)
     */ 
    get SUB(): Pattern {
        !this._sub && (this._sub = new Pattern())
        return this._sub
    }

    /**
     * Initialise a new pattern and multiply it with the previous chain
     * @returns {Pattern}
     * @example s0.px.n.range(0,16).MUL.noise(0,16,1)
     */ 
    get MUL(): Pattern {
        !this._mul && (this._mul = new Pattern())
        return this._mul
    }

    /**
     * Initialise a new pattern and divide it from the previous chain
     * @returns {Pattern}
     * @example s0.px.n.range(0,16).DIV.noise(0,16,1)
     */ 
    get DIV(): Pattern {
        !this._div && (this._div = new Pattern())
        return this._div
    }

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
        this._and?.reset()
        this._or?.reset()
        return this
    }

    /**
     * Inset another pattern's stack into the current pattern's stack
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.p.amp.sine()
    s1.p.pan.eval(s0.p.amp);
     */
    use(pattern: Pattern): Pattern {
        this.stack.push(...pattern.stack)
        return this
    }

    /**
     * Get the current value of another pattern, replaces the previous value in the pattern chain
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
     * Alias for `eval`
     */ 
    e(pattern: Pattern): Pattern {
        return this.eval(pattern)
    }

    /**
     * Negate the value passed as the first argument
     * @param {boolean | Pattern} x - a boolean or pattern
     * @returns {Pattern}
     * @example 
     * s0.e.every(3)
     * s1.e.not(s0.e)
     * s2.e.not(!(t%3))
     */ 
    not(x: boolean | Pattern): Pattern {
        this.stack.push(() => {
            const value = x instanceof Pattern ? x._value : x
            return !value ? 1 : 0
        })
        return this
    }

    /**
     * Toggle on or off using the value passed as the first argument
     * A true value will toggle the pattern on, a false value will toggle it off
     * Accepts a boolean or pattern as the first argument
     * @param {boolean | Pattern} x - a boolean or pattern
     * @returns {Pattern}
     * @example
     * s0.e.every(3)
     * s1.e.toggle(s0.e)
     * s2.e.toggle(!(t%3))
     */ 
    toggle(x: boolean | Pattern): Pattern {
        this.stack.push(() => {
            const value = x instanceof Pattern ? x._value : x
            if (value) this._toggle = !this._toggle
            return this._toggle ? 1 : 0
        })
        return this
    }

    /**
     * Generate a range of values between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.harm.tri(0, 4, 0.25)
     */
    tri(lo: number = 0, hi: number = 1, step: number = 0, freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => {
            const tri = Math.abs(pos(x, this._q, freq) - 0.5) * 2
            return mapToRange(tri, 0, 1, lo, hi, step)
        })
        return this
    }

    /**
     * Generate a pulse wave between lo and hi. Use as the first call in a pattern chain.
     * @param lo - lowest value in range
     * @param hi - highest value in range
     * @param width - width of the pulse. Default is 0.5, which means a square wave.
     * @param freq - number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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

    /**
     * Choose from a sequence of values. Use as the first call in a pattern chain.
     * @param values an array of values
     * @param freq number of iterations of the sequence, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.n.seq([60,72,74,76])
     */
    seq(values: number[] = [], freq: number = 1): Pattern {
        this.stack.push((x: patternValue) => values[Math.floor((pos(x, this._q, freq)*values.length)%values.length)])
        return this
    }
    
    /**
     * Add a value to the previous value in the pattern chain.
     * @param value value to add
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).add(12)
     */
    add(value: number = 0): Pattern {
        this.stack.push(x => handle(x, x => x + value))
        return this
    }

    /**
     * Subtract a value from the previous value in the pattern chain.
     * @param value value to subtract
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).sub(12)
     */
    sub(value: number = 0): Pattern {
        this.stack.push(x => handle(x, x => x - value))
        return this
    }

    /**
     * Reverse subtract a value from the previous value in the pattern chain.
     * @param value value to subtract
     * @returns {Pattern}
     * @example s0.p.amp.noise(0.5,0.25).$sub(1)
     */
    $sub(value: number = 0): Pattern {
        this.stack.push(x => handle(x, x => value - x))
        return this
    }

    /**
     * Multiply the previous value in the pattern chain by a value.
     * @param value value to multiply by
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).mul(2)
     */ 
    mul(value: number = 1): Pattern {
        this.stack.push(x => handle(x, x => x * value))
        return this
    }

    /**
     * Divide the previous value in the pattern chain by a value.
     * @param value value to divide by
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).div(2)
     */
    div(value: number = 1): Pattern {
        this.stack.push(x => handle(x, x => x / value))
        return this
    }

    /**
     * Reverse divide the previous value in the pattern chain by a value.
     * @param value value to divide by
     * @returns {Pattern}
     * @example s0.p.modi.noise(1,2).$div(2)
     */ 
    $div(value: number = 1): Pattern {
        this.stack.push(x => handle(x, x => value / x))
        return this
    }

    /**
     * Modulo the previous value in the pattern chain by a value.
     * @param value value to modulo by
     * @returns {Pattern}
    */ 
    mod(value: number = 1): Pattern {
        this.stack.push(x => handle(x, x => ((x % value) + value) % value))
        return this
    }

    /**
     * Round the previous value in the pattern chain to the step value.\
     * @param value value to round to
     * @returns {Pattern}
     */
    step(value: number): Pattern {
        this.stack.push(x => handle(x, x => roundToFactor(x, value)))
        return this
    }

    /**
     * Clamp the previous value in the pattern chain to a range.
     * @param min minimum value
     * @param max maximum value
     * @returns {Pattern}
     */ 
    clamp(min: number, max: number): Pattern {
        this.stack.push(x => handle(x, x => clamp(x, min, max)))
        return this
    }

    /**
     * Test if the previous value in the pattern chain is greater than a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.noise(0,1).gt(0.3, 60, 72)
     */ 
    gt(n: number, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x > n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is less than a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    lt(n: number, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x < n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is greater than or equal to a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.noise(0,1).gte(0.3, 60, 72)
     */ 
    gte(n: number, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x >= n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is less than or equal to a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */
    lte(n: number, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x <= n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is equal to a value using ==.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    eq(n: number = 1, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x == n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is equal to a value using ===.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    eqq(n: number = 1, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x === n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is not equal to a value using !=.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    neq(n: number = 1, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x != n) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is not equal to a value using !==.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    neqq(n: number = 1, a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => x !== n) ? a : b)
        return this
    }

    /**
     * Invert the previous value in the pattern chain - like a bitwise NOT.
     * Returns a 0 if true, and a 1 if false.
     * @returns {Pattern}
     */ 
    invert(): Pattern {
        this.if(0, 1)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is an odd number
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    odd(a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(odd) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is an even number
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    even(a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(even) ? a : b)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is a truthy or falsy value
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    if(a: number = 1, b: number = 0): Pattern {
        this.stack.push(x => [x].flat().every(x => !!x) ? a : b)
        return this
    }

    
    /**
     * Convert the previous value from beats to seconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.p.dur(1).bts().mul(1000)
     */ 
    bts(): Pattern {
        this.stack.push(x => handle(x, x => x * (60/this._bpm)))
        return this
    }

    /**
     * Convert the previous value from beats to milliseconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.p.dur(1).btms()
     */ 
    btms(): Pattern {
        this.stack.push(x => handle(x, x => x * (60000/this._bpm)))
        return this
    }

    /**
     * Provide a callback function to the previous value in the pattern chain
     * @param cb callback function
     * @returns {Pattern}
     * @example s0.p.modi.seq([0,1,2,3]).fn(x => x * 2)
     */ 
    fn(cb: {(x: patternValue): patternValue}): Pattern {
        this.stack.push(cb)
        return this
    }

    /**
     * Use the previous value in the pattern chain as an index to retrieve a value from an array of musical scales
     * @param names name of scale or array of scale names. Scales follow root-scale format, e.g. 'c-major'.
     * @todo show link to available scales
     * @param length length of each scale
     * @param freq number of iterations of the pattern
     * @returns {Pattern}
     * @example s0.p.n.scales('c-dorian', 16)
     */ 
    scales(names: string | string[], length: number = 8, freq: number = 1): Pattern {
        const scales = [names].flat().map(name => {
            const scale = getScale(name)
            return scale.slice(0, min(length, scale.length))
        })
        this.seq(scales.flat(), freq).add(48)
        return this
    }

    /**
     * Use the previous value in the pattern chain as an index to retrieve a chord from an array of musical chords
     * @param names name of chord or array of chord names. Chords follow root-chord format, e.g. 'd-min7'.
     * @todo show link to available chords
     * @param freq number of iterations of the pattern
     * @returns {Pattern}
     * @example s0.p.n.chords(['d-min7', 'g-dom7'])
     */ 
    chords(names: string | string[], freq: number = 1): Pattern {
        this.seq([names].flat().map(name => getChord(name)), freq).add(48)
        return this
    }

    /**
     * Get the sine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    sin(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.sin(+x))) 
        return this
    }

    /**
     * Get the cosine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    cos(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.cos(+x)))
        return this
    }

    /**
     * Get the tangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    tan(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.tan(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    asin(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.asin(+x)))
        return this
    }

    /**
     * Get the arccosine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    acos(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.acos(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    atan(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.atan(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @param y value to divide by
     * @returns {Pattern}
     */ 
    atan2(y: number): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.atan2(+x, y)))
        return this
    }

    /**
     * Get the absolute value of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    abs(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.abs(+x)))
        return this
    }

    /**
     * Get the ceiling of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    ceil(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.ceil(+x)))
        return this
    }

    /**
     * Get the floor of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    floor(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.floor(+x)))
        return this
    }

    /**
     * Round the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    round(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.round(+x)))
        return this
    }

    /**
     * Get the exponential of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    exp(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.exp(+x)))
        return this
    }

    /**
     * Get the natural log of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    log(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.log(+x)))
        return this
    }

    /**
     * Get the maximum of the previous value in the pattern chain and a given value
     * @param compare value to compare to
     * @returns {Pattern}
     */ 
    max(compare: number = 0): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.max(+x, compare)))
        return this
    }

    /**
     * Get the minimum of the previous value in the pattern chain and a given value
     * @param compare value to compare to
     * @returns {Pattern}
     */ 
    min(compare: number = 0): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.min(+x, compare)))
        return this
    }

    /**
     * Multiply the previous value in the pattern chain to the power of a given value
     * @param exponent value to multiply by
     * @returns {Pattern}
     */ 
    pow(exponent: number = 2): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.pow(+x, exponent)))
        return this
    }

    /**
     * Get the square root of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    sqrt(): Pattern {
        this.stack.push((x: patternValue) => handle(x, x => Math.sqrt(+x)))
        return this
    }

    /**
     * push additional functions to the pattern stack if logic operators have been applied
     * @param t current time
     * @param q current division
     * @param bpm current bpm
     * @hidden
     */ 
    applyLogic(t: number, q: number, bpm?: number) {
        const AND = this._and && this._and.get(t, q, bpm);
        const OR = this._or && this._or.get(t, q, bpm);
        const XOR = this._xor && this._xor.get(t, q, bpm);
        AND !== null && this.fn(x => x && AND ? 1 : 0)
        OR !== null && this.fn(x => x || OR ? 1 : 0)
        XOR !== null && this.fn(x => x !== XOR ? 1 : 0)
    }

    /**
     * push additional functions to the pattern stack if math operators have been applied
     * @param t current time
     * @param q current division
     * @param bpm current bpm
     * @hidden
     */ 
    applyMath(t: number, q: number, bpm?: number) {
        const ADD = this._add && this._add.get(t, q, bpm);
        const SUB = this._sub && this._sub.get(t, q, bpm);
        const MUL = this._mul && this._mul.get(t, q, bpm);
        const DIV = this._div && this._div.get(t, q, bpm);
        ADD !== null && this.add(+ADD)
        SUB !== null && this.sub(+SUB)
        MUL !== null && this.mul(+MUL)
        DIV !== null && this.div(+DIV)
    }

    /** @hidden */
    get(t: number, q: number, bpm?: number): patternValue | null {
        this._q = q
        this._bpm = bpm || this._bpm

        this.applyLogic(t, q, bpm)
        this.applyMath(t, q, bpm)
        
        const value = this.stack.length 
            ? this.stack.reduce((val: patternValue, fn) => fn(val), t) 
            : null
        
        this._value = value || 0
        return value
    }

    /** @hidden */
    has() : boolean {
        return !!this.stack.length
    }
}