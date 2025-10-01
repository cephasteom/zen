import { get } from 'svelte/store';
import { complex, round, pow, abs } from 'mathjs'
import { nanoid } from 'nanoid'
import type { stack, patternValue, patternable, Dictionary, PatternMethod } from '../types'
import { 
    mapToRange, 
    roundToFactor, 
    roundToNearest,
    clamp,
    numberToBinary,
    calculateNormalisedPosition as pos, 
    odd, 
    even,
    interpolate,
    handleArrayOrSingleValue as handlePolyphony,
    memoize,
    weightedChoice
} from '../utils/utils';
import { parsePattern } from '../parsing/mininotation';
import { parseMidiFile } from '../parsing/midifile';
import { noise, randomSequence } from '../stores'
import { getCC, getNotes } from '../stores/midi'
import { circuit } from './Circuit'

const channel = new BroadcastChannel('zen')

/**
 * Patterns are the building blocks of Zen. They are used to generate patterns of values in interesting, concise ways.
 */
export class Pattern implements Dictionary {
    /** @hidden */
    private _id: string = ''
    
    /**
     * The value of the pattern after get() has been called
     * Enables use of pattern value in other patterns, using e.g. s1.e.eval(s0.e)
     * @hidden
     */
    private _value: patternValue = 0

    /** @hidden */
    private stack: stack = []

    /** @hidden */
    private _t: number = 0

    /** @hidden */
    private _q: number = 16 // divisions per cycle

    /** @hidden */
    private _bpm: number = 120

    /**
     * State object for pattern methods that require it
     * Clears on reset()
     * @hidden
     */
    private _state = {} as any

    /**
     * Shorthand aliases for pattern methods.
     * @example
     * 
    qm: 'qmeasurement',
    qms: 'qmeasurements',
    qpb: 'qprobability',
    qpbs: 'qprobabilities',
    qph: 'qphase',
    qphs: 'qphases',
    qr: 'qresult',
    */ 
    aliases = {
        qm: 'qmeasurement',
        qms: 'qmeasurements',
        qpb: 'qprobability',
        qpbs: 'qprobabilities',
        qph: 'qphase',
        qphs: 'qphases',
        qr: 'qresult',
    }

    rng(t: number) {
        return get(randomSequence)[t % 256] || Math.random()
    }

    /** @hidden */
    constructor(isTrigger=false) {
        this._id = nanoid()
        this.reset()
        isTrigger && (this.set = this.trigger)
            
        // handle aliases
        return new Proxy(this, {
            get: (target, prop) => {
                // @ts-ignore
                if (prop in target) return target[prop]

                // @ts-ignore
                const name = this.aliases[prop] || prop
                // @ts-ignore
                if (name in target) return target[name]
                // @ts-ignore
                return target[prop]
            },
        })
    }

    /**
     * Handle arguments of different types
     * Used to format the arguments passed to pattern methods
     * @hidden 
     */ 
    handleTypes(value: patternValue | Pattern | string | Function, t: number | null = null, round=true) : patternValue {
        const time = t !== null && t !== undefined
            ? t
            : this._t
        if(value instanceof Pattern) return value.get(time, this._q, this._bpm) || 0
        if(typeof value === 'function') return value(time, this._q)
        if(typeof value === 'string') return parsePattern(value, time, this._q, this._id, round)
        return value
    }

    /** @hidden */
    reset(value?: patternable): Pattern {
        this.stack = []
        this._value = 0
        this._state = {
            persist: this._state?.persist || false,
        }
        if(value !== undefined) this.set(value)
        return this
    }

    /** 
     * @hidden 
     * Used internally to normalise a value
     * */
    normalise(freq: patternable = 1, cycles: patternable = 1) {
        this.stack.push(x => pos(x, this._q, +this.handleTypes(freq), +this.handleTypes(cycles)))
        return this
    }

    /** 
     * @hidden 
     * Used internally to work out the number of divisions in a pattern
     * Based on the divisions of a cycle and the frequency of the pattern
     * */
    divisions(freq: patternable = 1) {
        this.q().div(freq)
        return this
    }
    
    /**
     * Return the current time
     * @example 
     * s0.x.t().mul(2)
     * @returns {Pattern}
     */
    t(): Pattern {
        this.stack.push(() => this._t)
        return this
    }

    /**
     * Return the current cycle
     * @example 
     * s0.e.set(1)
     * s0.x.c()
     * @returns {Pattern}
     */
    c(): Pattern {
        this.stack.push(() => Math.floor(this._t / this._q))
        return this
    }

    /**
     * Return the current divisions per cycle
     * @returns {Pattern}
     */
    q(): Pattern {
        this.stack.push(() => this._q)
        return this
    }

    /**
     * Create a new pattern.
     * Used internally
     * @hidden
     * @returns {Pattern}
     */
    p(isTrigger = false): Pattern {
        return new Pattern(isTrigger)
    }

    /**
     * Set a single value
     * @param value - a single string or number or array of strings or numbers, or a Pattern, or a Zen pattern string
     * @returns {Pattern}
     * @example s0.amp.set(1)
     * @example s1.e.set(s0.e)
     * @example s0.e.set('1?0*16')
     * @example s0.x.set(t => t) // run a function, with the first argument being the current time
     */
    set(value: patternable): Pattern {
        this.stack.push(t => this.handleTypes(value, +t))
        return this
    }

    /**
     * Trigger a value in pattern, only if it fall directly onto a division
     * Events and Mutations use this method instead of set()
     * @param value - a single string or number or array of strings or numbers, or a Pattern, or a Zen pattern string
     * @returns {Pattern}
     * @hidden
     * // compare with s0.e.set('1*4')
     * s0.e.trigger('1*4')
     */ 
    trigger(value: patternable): Pattern {
        this.stack.push(t => this.handleTypes(value, +t, false))
        return this
    }

    /**
     * 
     * @param event - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.x.count(s0.e).div(16)
s0.e.every('0?1*4|*2')
     */
    count(event: patternable = 1): Pattern {
        let count = 0
        this.stack.push(t => {
            const shouldCount = this.handleTypes(event, +t, false)
            return shouldCount ? count++ : count
        })
        return this
    }

    /**
     * Count up from 0 to n-1 or Infinity if n is 0. 
     * Restarts the counter each time reset is true.
     * @param n - the number to count up to, default is 0
     * @param reset - a value, instance of Pattern, or Zen pattern string that resets the counter
     * @returns {Pattern}
     * @example s0.set({inst: 1, bank: 'bd'})
     * s0.x.counter(16, s0.e).div(q())
     * s0.e.set('3:8')
     */
    counter(n: patternable = 0, reset: patternable): Pattern {
        let count = 0
        
        this.stack.push((t) => {
            const shouldReset = this.handleTypes(reset, +t, false)
            count = shouldReset ? 0 : count + 1
                
            const limit = +this.handleTypes(n)
            return limit === 0 ? count : count % limit
        })        
        return this
    }

    /**
     * When trigger is true, samples the value returned by the previous pattern in the chain, and holds it until the next trigger.
     * @param trigger - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(5)
     * s0.x.noise().hold(s0.e)
     */
    hold(trigger: patternable): Pattern {
        let heldValue: any = 0
        this.stack.push((value) => {
            if(this.handleTypes(trigger, this._t, false)) heldValue = value
            return heldValue
        })
        return this
    }

    /**
     * Inset another pattern's stack into the current pattern's stack
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.amp.sine()
    s1.pan.use(s0.amp);
     */
    use(pattern: Pattern): Pattern {
        this.stack.push(...pattern.stack)
        return this
    }

    /**
     * Get the current value of pattern if it has been evaluated. Used internally. Possibly deprecated.
     * @hidden
     */ 
    value(): patternValue {
        return this._value
    }

    /**
     * Negate the value passed as the first argument
     * @param x - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example 
     * s0.e.every(3)
     * s1.e.not(s0.e)
     * s3.e.every(1).and(not(s0.e)).and(not(s1.e))
     */ 
    not(x: patternable): Pattern {
        this.stack.push(() => this.handleTypes(x) 
            ? 0 
            : 1
        )
        return this
    }

    /**
     * Toggle on or off using the value passed as the first argument
     * A true value will toggle the pattern on, a false value will toggle it off
     * @param x - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example
     * s0.e.every(8)
     * s1.e.toggle(s0.e)
     * s1.y.set(0.5)
     */ 
    toggle(x: patternable): Pattern {
        const st = this._state
        this.set(x)
            .fn(x => st.toggle = x ? !st.toggle : st.toggle)
            .ifelse()
        return this
    }

    /**
     * On/off. Returns 1 when on, 0 when off.
     * True values passed to the first argument will turn the pattern on, false values are ignored.
     * True values passed to the second argument will turn the pattern off, false values are ignored.
     * @param i - a value, instance of Pattern, or Zen pattern string
     * @param o - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example
     * s0.e.io(s1.e, s2.e)
     */ 
    io(i: patternable, o: patternable): Pattern {
        this.stack.push(() => {
            if (this.handleTypes(i)) this._state.io = true
            if (this.handleTypes(o)) this._state.io = false
            return this._state.io ? 1 : 0
        })
        return this
    }

    // CONDITIONALS
    /**
     * Test if the previous value in the pattern chain is a truthy or falsy value
     * If true return new value, if false, simply pass on the previous value
     * @param ifValue - a value, instance of Pattern, or Zen pattern string
     * @param elseValue - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     */ 
    ifelse(ifValue: patternable = 1, elseValue: patternable = 0): Pattern {
        this.stack.push(x => {
            return [x].flat().every(x => !!x) 
                ? this.handleTypes(ifValue) 
                : this.handleTypes(elseValue) 
        })
        return this
    }

    /**
     * If the previous value in the pattern chain is truthy, return a new value, otherwise return previous value.
     * @param value - a value, instance of Pattern, or Zen pattern string
     * @deprecated - use ifelse() instead, kept for backwards compatibility
     * @returns {Pattern}
     */
    if(value: patternable): Pattern {
        console.warn('Pattern.if() is deprecated, use Pattern.ifelse() instead')
        this.stack.push(x => {
            return [x].flat().every(x => !!x)
                ? this.handleTypes(value)
                : x
        })
        return this
    }

    /**
     * If the previous value in the pattern chain is falsy, return a new value, otherwise return previous value.
     * @param value - a value, instance of Pattern, or Zen pattern string
     * @deprecated - use ifelse() instead, kept for backwards compatibility
     * @returns {Pattern}
     */
    else(value: patternable): Pattern {
        console.warn('Pattern.else() is deprecated, use Pattern.ifelse() instead')
        this.stack.push(x => {
            return [x].flat().every(x => !x)
                ? this.handleTypes(value)
                : x
        })
        return this
    }

    // MATHS
    /**
     * Map the preceding value in the chain to a new range.
     * @param outMin - the new minimum value
     * @param outMax - the new maximum value 
     * @param inMin - the minimum value of the input range. Default is 0.
     * @param inMax - the maximum value of the input range. Default is 1.
     * @returns 
     */
    mtr(outMin: patternable, outMax: patternable, inMin: patternable = 0, inMax: patternable = 1): Pattern {
        this.stack.push(x => {
            const [l=0, h=1, il=0, ih=1] = [outMin, outMax, inMin, inMax].map(arg => this.handleTypes(arg))
            return mapToRange(+x, +il, +ih, +l, +h, 0)
        })
        return this
    }
    /**
     * Add a value to the previous value in the pattern chain.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.noise(1,60,72).add(12)
     * @example s0.n.noise(1,60,72).add('0?12*16')
     */
    add(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x + +this.handleTypes(value)))
        return this
    }

    /**
     * Subtract a value from the previous value in the pattern chain.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.noise(1,60,72).sub(12)
     */
    sub(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x - +this.handleTypes(value)))
        return this
    }    

    /**
     * Reverse subtract. Subtract the previous value in the pattern chain from a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.amp.noise(1,0.5,0.25).subr(1)
     */
    subr(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => +this.handleTypes(value) - x))
        return this
    }

    /**
     * Multiply the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.noise(1,60,72).mul(2)
     */ 
    mul(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x * +this.handleTypes(value)))
        return this
    }

    /**
     * Divide the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.noise(1,60,72).div(2)
     */
    div(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x / +this.handleTypes(value)))
        return this
    }

    /**
     * Reverse divide the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.modi.noise().mul(2)
     */ 
    divr(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => +this.handleTypes(value) / x))
        return this
    }   

    /**
     * Modulo the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.set(t).mod(12).add(36)
     */ 
    mod(value: patternable): Pattern {
        this.stack.push(x => {
            const m = +this.handleTypes(value)
            return handlePolyphony(x, x => ((x % m) + m) % m)
        })
        return this
    }   
    
    // COMPARISON
    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).and(t().mod(5))
     */ 
    and(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x && +this.handleTypes(value, this._t, false)))
        return this
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).or(t().mod(2))
     */ 
    or(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x || +this.handleTypes(value, this._t, false)))
        return this
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).xor(t().mod(2))
     */ 
    xor(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x ^ +this.handleTypes(value, this._t, false)))
        return this
    }

    // Generators
    /**
     * Generate a range of values between lo and hi. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.modi.range(0, 10, 1, 2)
     */
    range(freq: patternable = 1, lo: patternable = 0, hi: patternable = 1): Pattern {
        this.normalise(freq).mtr(lo, hi)
        return this
    }

    /**
     * Generate a sine wave between lo and hi. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.modi.sine().mul(10)
     */
    sine(freq: patternable = 1, lo: patternable = 0, hi: patternable = 1): Pattern {
        this.normalise(freq)
            .mul(360 * (Math.PI/180))
            .sin()
            .mtr(lo, hi, -1, 1)
        return this
    }

    /**
     * Generate a cosine wave between lo and hi. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.modi.cosine().mul(10)
     */
    cosine(freq: patternable = 1, lo: patternable = 0, hi: patternable = 1): Pattern {
        this.normalise(freq)
            .mul(360 * (Math.PI/180))
            .cos()
            .mtr(lo, hi, -1, 1)
        return this
    }

    /**
     * Generate a saw wave between lo and hi. Alias of range. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.modi.saw().mul(10)
     */
    saw(freq: patternable = 1, lo: patternable = 0, hi: patternable = 1): Pattern {
        return this.range(freq, lo, hi)
    }

    /**
     * Generate a curve between lo and hi. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param curve curve of the pattern. Default is 0.5, which means a linear curve.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     */
    curve(freq: patternable = 1, lo: patternable = 0, curve: patternable = 0.5, hi: patternable = 1): Pattern {
        this.normalise(freq)
            .pow(curve)
            .mtr(lo, hi)
        return this
    }
    
    /**
     * Generate a triangle wave between lo and hi. Use as the first call in a pattern chain.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.harm.tri(0.25).mul(4)
     */
    tri(freq: patternable = 1, lo: patternable = 0, hi: patternable = 1): Pattern {
        this.normalise(freq)
            .sub(0.5)
            .abs()
            .mul(2)
            .mtr(lo, hi)
        return this
    }

    /**
     * Generate a pulse wave between lo and hi. Use as the first call in a pattern chain.
     * @param freq - number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param width - width of the pulse. Default is 0.5, which means a square wave.
     * @param lo - lowest value in range
     * @param hi - highest value in range
     * @returns {Pattern}
     * @example s0.modi.pulse(0.25, 1, 10)
    */
    pulse(freq: patternable = 1, width: patternable = 0.5, lo: patternable = 0, hi: patternable = 1): Pattern {
        this.normalise(freq)
            .mod(1)
            .lt(+width)
            .mtr(lo, hi)
        return this
    }

    /**
     * Generate a square wave between lo and hi. Use as the first call in a pattern chain. See also pulse.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.modi.square(1,0,10)
    */
    square(freq: patternable=1, lo: patternable=0, hi: patternable=1): Pattern {
        this.pulse(freq, 0.5, lo, hi)
        return this
    }

    /**
     * Generate a random number between lo and hi.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.n.random(60,72).step(1)
     */
    random(lo: patternable=0, hi: patternable=1): Pattern {
        this.fn(x => this.rng(+x))
            .mtr(lo, hi)
        return this
    }

    /**
     * Generate a number between lo and hi, using a simplex noise function.
     * @param freq Speed of the noise function.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @returns {Pattern}
     * @example s0.pan.noise()
    */
    noise(freq: patternable = 1, lo: patternable=0, hi: patternable=1): Pattern {
        this.mul(freq) // divide the time by the frequency
            .div(16) // slow down the noise function so it's a bit smoother
            .fn(x => get(noise).simplex2(x, 0))
            .mtr(lo, hi, -1, 1)
        return this
    }

    /**
     * Generate truthy or falsy values every n divisions.
     * @param n number of divisions
     * @returns {Pattern}
     * @example s0.e.every(4) // return 1 every 4 divisions, 0 otherwise
     */
    every(n: patternable): Pattern {
        this.mod(n).eq(0)
        return this
    }

    /**
     * Generate truthy or falsy values from a binary string.
     * @param n binary string
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.e.bin('1111') // output depends on the number of division per cycle / canvas. If 16, returns 1 every 4 divisions, 0 otherwise
    */
    bin(n: string = '10000000', freq: patternable = 1): Pattern {
        const arr = n.replace(/\s+/g, '').split('').map(x => !!parseInt(x) ? 1 : 0)
        this.mod(this.p().divisions(freq))
            .div(this.p().divisions(freq).div(arr.length))
            .atr(arr)
        return this
    }

    /**
     * Convert a number to binary string, then passes it to .bin().
     * @param n a number
     * @param q the length of the binary string
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.n.ntbin(9, 8) // 9 in binary is 1001, padded out to 8 digits. Passes 00001001 to .bin()
     */
    ntbin(n: patternable = 0, q: number = 8, freq: patternable = 1): Pattern {
        return this.bin(numberToBinary(+n, q), freq)
    }

    /**
     * Choose from a sequence of values. Use as the first call in a pattern chain.
     * @param values an array of values
     * @param freq number of iterations of the sequence, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.n.seq([60,72,74,76])
     */
    seq(values: number[] = [], freq: patternable = 1): Pattern {
        this.normalise(freq)
            .mul(values.length).floor().mod(values.length)
            .atr(values)
        return this
    }

    /**
     * Round the previous value in the pattern chain to the step value.
     * @param value value to round to
     * @returns {Pattern}
     */
    step(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => roundToFactor(x, +this.handleTypes(value))))
        return this
    }

    /**
     * Snap the previous value in the pattern chain to the nearest value in an array.
     * @param array array of values to snap to
     * @returns {Pattern}
     * @example s0.x.random(0,1).snap([0,0.25,0.5,0.75])
     * s0.e.set(1)
     */
    snap(array: patternable): Pattern {
        this.stack.push(x => {
            const arr = this.handleTypes(array)
            if(!Array.isArray(arr)) return x
            return handlePolyphony(x, x => roundToNearest(x, arr))
        })
        return this
    }

    /**
     * Round the previous value in the pattern chain to the nearest value in an array.
     * @param array array of values to round to
     * @returns {Pattern}
     * @example s0.n.noise(1,0,12).tune([0,2,4,5,7,9,11,12]).add(36)
     */ 
    tune(array: patternable): Pattern {
        // this.step(1).mod(12)
        this.stack.push(x => {
            const arr = this.handleTypes(array)
            if(!Array.isArray(arr)) return x

            const min = Math.min(...arr)
            const max = Math.max(...arr)
            const octaves = Math.floor((max - min) / 12) + 1
            return handlePolyphony(x, x => roundToNearest(
                Math.round(x) % (octaves * 12), 
                arr.map(x => (x - min) + (min % 12))
            ) + Math.floor(x / 12) * 12)
        })
        return this
    }

    /**
     * Clamp the previous value in the pattern chain to a range.
     * @param min minimum value
     * @param max maximum value
     * @returns {Pattern}
     */ 
    clamp(min: patternable, max: patternable): Pattern {
        this.stack.push(x => { 
            const [mn=0, mx=1] = [min,max].map(arg => this.handleTypes(arg))
            return handlePolyphony(x, x => clamp(x, +mn, +mx))
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is greater than a value.
     * @param value value to test against
     * @returns {Pattern}
     * @example s0.n.noise(1).gt(0.3).ifelse(60, 72)
     */ 
    gt(value: patternable): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x > +n) ? 1 : 0
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is less than a value.
     * @param value value to test against
     * @returns {Pattern}
     */ 
    lt(value: patternable = 1): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x < +n) ? 1 : 0
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is greater than or equal to a value.
     * @param value value to test against
     * @returns {Pattern}
     * @example s0.n.noise().gte(0.3).ifelse(60, 72)
     */ 
    gte(value: patternable): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x >= +n) ? 1 : 0
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is less than or equal to a value.
     * @param value value to test against
     * @returns {Pattern}
     */
    lte(value: patternable): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x <= +n) ? 1 : 0
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is equal to a value using ==.
     * @param value value to test against
     * @returns {Pattern}
     */ 
    eq(value: patternable): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x == n) ? 1 : 0
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is not equal to a value using !=.
     * @param value value to test against
     * @returns {Pattern}
     */ 
    neq(value: patternable): Pattern {
        this.stack.push(x => {
            const n = this.handleTypes(value)
            return [x].flat().every(x => x != n) ? 1 : 0
        })
        return this
    }

    /**
     * Invert the previous value in the pattern chain - like a bitwise NOT.
     * Returns a 0 if true, and a 1 if false.
     * @returns {Pattern}
     */ 
    invert(): Pattern {
        this.stack.push(x => [x].flat().every(x => !!x) ? 0 : 1)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is an odd number
     * @returns {Pattern}
     */ 
    odd(): Pattern {
        this.fn(x => odd(+x) ? 1 : 0)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is an even number
     * @returns {Pattern}
     */ 
    even(): Pattern {
        this.fn(x => even(+x) ? 1 : 0)
        return this
    }
    
    /**
     * Convert the previous value from beats to seconds, scaling by bpm.
     * Or, if a value is passed, convert that value from beats to seconds, scaling by bpm.
     * @returns {Pattern}
     * @example s0.dur(1).bts().mul(1000)
     * @example s0.dur(bts(1)).mul(1000) // this is equivalent
     */ 
    bts(value?: patternable): Pattern {
        this.btms(value).div(1000)
        return this
    }

    /**
     * Convert the previous value from beats to milliseconds, scaling by bpm.
     * Or, if a value is passed, convert that value from beats to milliseconds, scaling by bpm.
     * @returns {Pattern}
     * @example s0.dur(1).btms() // this is equivalent
     * @example s0.dur(btms(1)) // ...to this
     */ 
    btms(value?: patternable): Pattern {
        const fn = (x: patternValue) => handlePolyphony(x, x => x * (60000/this._bpm))
        value !== undefined
            ? this.stack.push(() => fn(this.handleTypes(value)))
            : this.fn(fn)
        return this
    }

    /**
     * Convert the previous value from divisions of a bar to seconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.q().ttms()
     */
    ttms(): Pattern {
        this.fn(x => handlePolyphony(x, x =>  x * (((60000/this._bpm) * 4) / this._q)))
        return this
    }

    /**
     * Provide a callback function to the previous value in the pattern chain
     * @param cb callback function
     * @returns {Pattern}
     * @example s0.modi.seq([0,1,2,3]).fn(x => x * 2)
     */ 
    fn(cb: {(x: patternValue): patternValue}): Pattern {
        this.stack.push(cb)
        return this
    }

    /**
     * Invert the previous chord in the pattern chain
     * @param n inversion
     * @returns {Pattern}
     * @example s0.n.set('Cmi7').inversion(1)
     */ 
    inversion(n: patternable): Pattern {
        this.stack.push((x: patternValue) => {
            const i = this.handleTypes(n)
            const chord = [x].flat()
            const length = chord.length
            const head = chord.slice(0, +i%length)
            const tail = chord.slice(+i%length)
            return [...tail, ...head.map(n => n + 12)].map(n => n + (12 * Math.floor((+i%(length*4))/length)))
        })
        return this
    }

    /**
     * Get a value, or values, from the previous value in the pattern chain
     * It is assumed that the previous value is an array
     * @param i index of value to retrieve, or array of indexes to retrieve. Negative numbers are counted from the end of the array.
     * @returns {Pattern}
     * @example s0.set({inst:0, cut:0})
     * s0.n.set('Ddor%16').at('0..8?*16')
     * s0.e.every(1)
     */ 
    at(i: patternable[]): Pattern {
        // @ts-ignore
        this.stack.push((data: any) => {
            // @ts-ignore
            const indexes = [this.handleTypes(i)]
                .flat()
                // if negative numbers, get index from the end of the array
                .map(i => i < 0 ? data.length + i : i)
            if(indexes.length === 1) return this.handleTypes(data[indexes[0] % data.length])
            
            const type = typeof data
            const result = type === 'object'
                // @ts-ignore
                ? indexes.map(i => data[i]).flat()
                // @ts-ignore
                : indexes.map(i => data[Math.floor(+i) % data.length]).flat()

            return result.map((n: any) => this.handleTypes(n))
            
        })
        return this
    }

    /**
     * At, but reversed. Given an array of values, it returns the value at the index provided by the previous value in the pattern chain.
     * @param array array of values
     * @returns {Pattern}
     * @example s0.x.t().atr([0,1,5,4]).div(16)
     */ 
    atr(array: patternable): Pattern {
        this.fn(i => {
            const a = [this.handleTypes(array)].flat()
            return a[Math.floor(+i) % a.length]
        })
        return this
    }

    /**
     * Size - number of values in the previous value in the pattern chain
     * @returns {Pattern}
     * @example s0.n.set([0,1,2,3]).size() // returns 4
     * @example s0.n.set('Cmaj7').size() // returns 4
     * @example s0.n.set('Cmaj7..*16').size() // returns 1 
     */
    size(): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return Array.isArray(data) || typeof data === 'string'
                ? data.length
                : 1 // if not an array, return 1
        })
        return this
    }

    /**
     * Map - apply a function to each value in the previous value in the pattern chain
     * @param cb callback function to apply to each value
     */
    map(cb: {(x: patternValue): patternValue}): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return data.map(cb).flat()
        })
        return this
    }

    /**
     * Reduce - reduce the previous value in the pattern chain to a single value
     * @param cb callback function to apply to each value
     * @param initial initial value to start the reduction
     * @returns {Pattern}
     */
    reduce(cb: {(acc: patternValue, x: patternValue): patternValue}, initial: patternValue = 0): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return data.reduce(cb, initial)
        })
        return this
    }

    /**
     * Filter - filter the previous value in the pattern chain
     * @param cb callback function to apply to each value
     * @returns {Pattern}
     */
    filter(cb: {(x: patternValue): boolean}): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return data.filter(cb).flat()
        })
        return this
    }

    /**
     * Slice - slice the previous value in the pattern chain
     * @param start start index of the slice
     * @param end end index of the slice
     * @returns {Pattern}
     */
    slice(start: patternable = 0, end: patternable = Infinity): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return data.slice(+start, +end).flat()
        })
        return this
    }

    /**
     * Some - test if some values in the previous value in the pattern chain pass a test
     * @param cb callback function to apply to each value
     * @returns {Pattern}   
     */
    some(cb: {(x: patternValue): boolean}): Pattern {
        this.stack.push((x: patternValue) => {
            const data = [x].flat()
            return data.some(cb) ? 1 : 0
        })
        return this
    }

    /**
     * Layer a value on top of the previous value in the pattern chain, forming an array of values
     * @param n 
     * @returns 
     * @example s0.n.set('Ddor%16..*16').layer(62)
     */
    layer(n: patternable): Pattern {
        this.stack.push(x => [x].flat().concat(this.handleTypes(n)))
        return this
    }

    // Maths
    /**
     * Get the sine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    sin(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.sin(+x))) 
        return this
    }

    /**
     * Get the cosine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    cos(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.cos(+x)))
        return this
    }

    /**
     * Get the tangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    tan(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.tan(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    asin(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.asin(+x)))
        return this
    }

    /**
     * Get the arccosine of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    acos(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.acos(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    atan(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.atan(+x)))
        return this
    }

    /**
     * Get the arctangent of the previous value in the pattern chain
     * @param y value to divide by
     * @returns {Pattern}
     */ 
    atan2(y: patternable): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.atan2(+x, +this.handleTypes(y))))
        return this
    }

    /**
     * Get the absolute value of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    abs(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.abs(+x)))
        return this
    }

    /**
     * Get the ceiling of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    ceil(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.ceil(+x)))
        return this
    }

    /**
     * Get the floor of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    floor(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.floor(+x)))
        return this
    }

    /**
     * Round the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    round(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.round(+x)))
        return this
    }

    /**
     * Get the exponential of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    exp(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.exp(+x)))
        return this
    }

    /**
     * Get the natural log of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    log(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.log(+x)))
        return this
    }

    /**
     * Get the maximum of the previous value in the pattern chain and a given value
     * @param compare value to compare to
     * @returns {Pattern}
     */ 
    max(compare: patternable = 0): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.max(+x, +this.handleTypes(compare))))
        return this
    }

    /**
     * Get the minimum of the previous value in the pattern chain and a given value
     * @param compare value to compare to
     * @returns {Pattern}
     */ 
    min(compare: patternable = 0): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.min(+x, +this.handleTypes(compare))))
        return this
    }

    /**
     * The previous value in the pattern chain to the power of a given value
     * @param exponent
     * @returns {Pattern}
     */ 
    pow(exponent: patternable = 2): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.pow(+x, +this.handleTypes(exponent))))
        return this
    }

    /**
     * Get the square root of the previous value in the pattern chain
     * @returns {Pattern}
     */ 
    sqrt(): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => Math.sqrt(+x)))
        return this
    }

    /**
     * Interpolate between a value and the previous value in the pattern chain
     * @param val value to interpolate to
     * @returns {Pattern}
     * @example s0.y.sine().intrp(sine(0.5))
     */ 
    interpolate(val: patternable): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => interpolate(+x, +this.handleTypes(val), 0.5)))
        return this
    }

    /**
     * Degrade the pattern, replacing values with 0 based on a probability
     * @param amt amount to degrade by. 1 is fully degraded (all 0s), 0 is not degraded at all
     * @returns {Pattern}
     */
    degrade(amt: patternable): Pattern {
        this.and(this.p().random().gt(amt))
        return this
    }

    // Chance
    /**
     * 50/50 chance of returning 1 or 0. Also, use `coin()`.
     * @returns {Pattern}
     * @example
     * s0.e.sometimes()
     */ 
    sometimes(): Pattern {
        this.t().random().gt(0.5)
        return this
    }

    /**
     * Alias for `sometimes`
     */ 
    coin(): Pattern {
        this.sometimes()
        return this
    }  

    /**
     * 25/75 chance of returning 1 or 0
     * @returns {Pattern}
     * @example
     * s0.e.rarely()
     */ 
    rarely(): Pattern {
        this.t().random().gt(0.8)
        return this
    }

    /**
     * 75/25 chance of returning a 1 or 0
     * @returns {Pattern}
     * @example
     * s0.e.often()
     */ 
    often(): Pattern {
        this.t().random().gt(0.25)
        return this
    }

    /**
     * Markov pattern generator
     * @param matrix transition matrix
     * @param states number of states to generate in the pattern. If 0, uses z.q. Default is 0.
     * @param frequency frequency - number of patterns to generate per cycle. Default is 1.
     * @returns {Pattern}
     * @example s0.set({inst: 1})
s0.bank.set(['bd', 'sd', 'hh']).at(
  markov(
    [[0,0.1,0.9], [0.25,0.1,0.9], [0.5,0.25,0.5]]),
    64,
    0.25
)
s0.e.set(1)
     */
    markov(matrix: number[][], states: patternable = 0, frequency: patternable = 1): Pattern {
        let sequence = [0]
        const patternLength = +this.handleTypes(states) || this._q
        for(let i = 0; i < patternLength; i++) {
            const current = sequence[sequence.length - 1]
            const next = weightedChoice(matrix[current])
            sequence.push(next)
        }
        this.seq(sequence, frequency)
        return this
    }

    /**
     * Use a midi cc on the selected device
     * @param cc control change number
     * @param device midi device index (default is 0)
     * @param value initial value (default is 1)
     * @returns {Pattern}
     * @example s0.vol.midicc(1,0.5,0)
     */
    midicc(cc: patternable, device: patternable = 0, value: patternable = 1): Pattern {
        this.stack.push(() => {
            // TODO: channel?
            const ccValue = getCC(+this.handleTypes(cc), +this.handleTypes(device))
            return ccValue !== undefined ? ccValue : +this.handleTypes(value)
        })
        return this
    }

    /**
     * Use the currently pressed key(s) on the selected device
     * @param device midi device index (default is 0)
     * @returns {Pattern}
     * @example s0.n.midinote()
     */
    midinote(device: patternable): Pattern {
        this.stack.push(() => getNotes(+this.handleTypes(device)))
        return this
    }

    /**
     * Use the notes from a midi file
     * @param path url path to midi file, must be available to the browser
     * @param param e | n | dur. Default n.
     * @returns {Pattern}
     * @example s0.n.midifile('path/to/midi.mid', 'n')
     * @example s0.dur.midifile('path/to/midi.mid', 'dur').btms()
     * @example s0.e.midifile('path/to/midi.mid', 'e')
     */
    midifile(path: string, param: string = 'n'): Pattern {
        let data: any;
        parseMidiFile(path, this._q)
            .then((d: any) => data = d)
        
        this.stack.push(t => {
            const division = +t % (data.bars * this._q)
            const events = Object.keys(data.notes).map(x => +x)
            const nearest = events.reduce((acc, cur) => +cur <= division ? +cur : acc, 0)
            const beatsElapsed = (division - nearest) / 4
            const dur = Math.max(data.durs[nearest] - beatsElapsed, 0)
            return {
                n: data.notes[nearest],
                e: data.events.includes(division),
                dur
            }[param] || 0
        })
        return this
    }

    /**
     * Returns a 1 the first time it is called, and 0 thereafter
     * @example s0.e.once()
     * @returns {Pattern}
     */
    once(): Pattern {
        this.stack.push(() => {
            const value = this._state.once ? 0 : 1
            this._state.once = true
            return value
        })
        return this
    }

    /**
     * Modify the value returned by a previous iteration of the pattern
     * @returns {Pattern}
     * @example z.grid.persist((t, prev) => prev ? [...prev, Math.random()] : [])
     */
    persist(fn: Function): Pattern {
        // memoize the persist value so that we don't affect it each time we call the function
        const get = memoize((t) => this._state.persist)
        this.stack.push((x: patternValue) => {
            // call function passing in t and previous value
            const result = fn(x, get(this._t))
            // set the result as the new persist value
            this._state.persist = result
            // return the result
            return result
        })
        return this
    }

    /**
     * Cache the value. Set how many values to cache and how many times to repeat the cache before it clears
     * @returns {Pattern}
     * @param size number of values to cache
     * @param repeats number of times to repeat the cache before it clears. Default is 1.
     * @example s0.e.random(0,1).step(1).cache(16,4)
     */
    cache(size: patternable = 1, repeats: patternable = 1): Pattern {
        let values: any[] = []
        
        this.stack.push((x: patternValue) => {
            const loop = clamp(+this.handleTypes(size), 0, 256)
            const nRepeats = +this.handleTypes(repeats)
            const reset = nRepeats > 0 
                ? this._t%(nRepeats * loop) === 0
                : false

            values = reset ? [] : values

            // if we are looping and we have a value, use it, otherwise use the current value
            const result = loop > 0 && loop <= values.length
                ? values[this._t%loop]
                : x

            // if we are looping and we don't have enough values, add the current one
            loop > 0 && loop > values.length
                && values.push(x)

            return result
        })
        return this
    }

    /**
     * Pack all arguments into an array
     * Arguments can be a value, instance of Pattern, or Zen pattern string
     * Each will be evaluated and packed into an array
     * @example s0.x.sine()
     * s0.y.noise()
     * s0.pack(s0.x, s0.y).print().fn(([x, y]) => ...)
     */
    pack(...args: patternable[]): Pattern {
        this.stack.push(() => args.map(x => this.handleTypes(x)).flat())
        return this
    }

    /**
     * Return the value of the measured qubit
     * @returns {Pattern}
     * @example s0.e.measurement(0)
     * @param qubit qubit to measure
     */
    qmeasurement(qubit: patternable = 0): Pattern {
        this.stack.push(() => {
            const q = +this.handleTypes(qubit)
            return circuit.measure(q) || 0
        })
        return this
    }

    /**
     * Return all measurements of the system as an array
     * @returns {Pattern}
     * @example s0.e.measurements()
     */
    qmeasurements(): Pattern {
        this.stack.push(() => circuit.measureAll() || [])
        return this
    }

    /**
     * Return the probability (squared amplitude coefficient) for a given state of the quantum system
     * @returns {Pattern}
     * @param state state to get probability of, as an integer
     * @example s0.amp.qprobability(0).print()
     */
    qprobability(state: patternable): Pattern {
        this.stack.push(() => {
            const length = circuit.numAmplitudes()
            const i = +this.handleTypes(state) % length
            return Number(pow(abs(round(circuit.state[i] || complex(0, 0), 14)), 2))
        })
        return this
    }

    /**
     * Returns an array of probabilities (squared amplitude coefficients) for all possible states of the quantum system
     * @returns {Pattern}
     * @example s0.probs.qprobabilities().print()
     */ 
    qprobabilities(): Pattern {
        this.stack.push(() => {
            const length = circuit.numAmplitudes()
            return Array.from({length}, (_, i) => {
                const state = round(circuit.state[i] || complex(0, 0), 14);
                const result = Number(pow(abs(state), 2))
                return parseFloat(result.toFixed(5))
            })
        })
        return this
    }

    /**
     * Returns the phase of a given state of the quantum system. 
     * Assuming that this value is between -PI and +PI, the result is normalised
     * @returns {Pattern}
     * @param state state to get phase of, as an integer
     * @example s0.phase.qphase(0).print()
     */
    qphase(state: patternable): Pattern {
        this.stack.push(() => {
            const states = circuit.stateAsArray()
            const i = +this.handleTypes(state) % states.length
            return mapToRange(states[i].phase, -Math.PI, Math.PI, 0, 1, 0)
        })
        return this
    }

    /**
     * Returns an array of phases for all basis states of the quantum system
     * @returns {Pattern}
     * @example s0.phases.qphases().print()
     */
    qphases(): Pattern {
        this.stack.push(() => {
            const states = circuit.stateAsArray()
            return states.map((state: any) => mapToRange(state.phase, -Math.PI, Math.PI, 0, 1, 0))
        })
        return this
    }

    /**
     * Returns the measured state as an integer - 
     * ie. in a 2-qubit system, 00 = 0, 01 = 1, 10 = 2, 11 = 3
     * @returns {Pattern}
     * @example s0.res.qresult().print()
     */
    qresult(): Pattern {
        this.qmeasurements().fn((x: any) => parseInt(x.reverse().join(''), 2))
        return this
    }

    /**
     * Post the current value to the console
     * @param prefix optional prefix to the message
     * @example s0.n.set('Cmi7').print('s0.n')
     */
    print(prefix: string = ''): Pattern {
        this.stack.push(x => {
            const message = prefix ? `${prefix}: ${x}` : x
            channel.postMessage({type: 'pattern', message: JSON.stringify(message)})
            return x
        })
        return this
    }

    /** @hidden */
    get(
        t: number, q: number, bpm?: number
    ): patternValue | null {
        this._t = t
        this._q = q
        this._bpm = bpm || this._bpm

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

    /** @hidden */
    static methods(): string[] {
        const aliases = Object.keys(new Pattern().aliases)
        return Object.getOwnPropertyNames(Pattern.prototype)
            .concat(aliases)
            .filter(method => !['constructor', 'handleTypes', '_', 'get', 'has'].includes(method))
    }

    /** @hidden */
    call(methodName: PatternMethod, ...args: any[]): any {
        if (typeof this[methodName] === 'function') {
            // @ts-ignore
            return this[methodName].apply(this, args);
        } else {
            throw new Error(`Method ${methodName} does not exist on Pattern`);
        }
    }
}