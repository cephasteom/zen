import { nanoid } from 'nanoid'
import type { Stream } from './Stream'
import type { stack, patternValue, patternable } from '../types'
import { 
    mapToRange, 
    roundToFactor, 
    roundToNearest,
    clamp, 
    noise, 
    numberToBinary, 
    min, 
    calculateNormalisedPosition as pos, 
    odd, 
    even,
    interpolate,
    handleArrayOrSingleValue as handlePolyphony
} from '../utils/utils';
import { getScale, getChord } from '../utils/musical';
import { parsePattern } from '../parser';

/**
 * Patterns are the building blocks of Zen. They are used to generate patterns of values in interesting, concise ways. The first value passed to a pattern is either time `t` or a position in space `x`, `y`, or `z`, depending on whether the pattern is assigned to a stream's `p`, `px`, `py`, or `pz` property. Patterns methods can be chained together applying each new method to the value passed from the previous one in the chain.
 * @example
 * s0.p.amp.range(0,1)
 * s0.px.drive.sine(0,1)
 * s0.py.modi.range(0,10).mul((t%q)/q)
 */
export class Pattern {
    /** 
     * The Pattern that instantiated this Pattern
     * @hidden 
     */
    private _parent: Pattern | Stream | null = null
    
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

    /** @hidden */
    _state: any = {
        $: [],
        toggle: false,
    }

    /**
     * Shorthand aliases for pattern methods.
     * @example
     * {
        add: 'a',
        and: 'an',
        bin: 'b',
        btms: 'bm',
        bts: 'bs',
        chords: 'ch',
        clamp: 'cl',
        coin: 'c',
        cosine: 'co',
        curve: 'cu',
        div: 'd',
        divr: 'dr',
        else: 'e',
        eq: 'eq',
        every: 'ev',
        if: 'i',
        interpolate: 'intrp',
        inversion: 'inv',
        invert: 'in',
        layer: 'la',
        mod: 'mo',
        mul: 'm',
        not: 'n',
        noise: 'no',
        ntbin: 'nb',
        or: 'o',
        often: 'of',
        parse: 'p',
        pulse: 'pu',
        random: 'rd',
        range: 'ra',
        rarely: 'r',
        saw: 'sa',
        scales: 'sc',
        seq: 'se',
        set: 'v',
        sine: 'si',
        square: 'sq',
        step: 'st',
        sometimes: 'so',
        sub: 's',
        subr: 'sr',
        toggle: 't',
        tri: 'tr',
        tune: 'tu',
        use: 'u',
        xor: 'x',
    }
    */ 
    aliases = {
        add: 'a',
        and: 'an',
        bin: 'b',
        btms: 'bm',
        bts: 'bs',
        chords: 'ch',
        clamp: 'cl',
        coin: 'c',
        cosine: 'co',
        curve: 'cu',
        div: 'd',
        divr: 'dr',
        else: 'e',
        eq: 'eq',
        every: 'ev',
        if: 'i',
        interpolate: 'intrp',
        inversion: 'inv',
        invert: 'in',
        layer: 'la',
        mod: 'mo',
        mul: 'm',
        not: 'n',
        noise: 'no',
        ntbin: 'nb',
        or: 'o',
        often: 'of',
        parse: 'p',
        pulse: 'pu',
        random: 'rd',
        range: 'ra',
        rarely: 'r',
        saw: 'sa',
        scales: 'sc',
        seq: 'se',
        set: 'v',
        sine: 'si',
        square: 'sq',
        step: 'st',
        sometimes: 'so',
        sub: 's',
        subr: 'sr',
        toggle: 't',
        tri: 'tr',
        tune: 'tu',
        use: 'u',
        xor: 'x',
    }

    /** @hidden */
    constructor(parent: Pattern | Stream | null = null) {
        this._id = nanoid()
        this._parent = parent
        this.reset()
        this.combine = this.combine.bind(this);
        
        // Set aliases
        Object.entries(this.aliases).forEach(([method, alias]) => {
            // @ts-ignore
            this[alias] = this[method]
            
            
            // create dollar method for alias, TODO: do we have to create a new pattern for this?
            Object.defineProperty(this, `$${alias}`, {
                get: () => {
                    const pattern = new Pattern(this)
                    this._state.$.push({method: alias, pattern})
                    return pattern
                }
            })
        });
    }

    /**
     * Handle arguments of different types
     * Used to format the arguments passed to pattern methods
     * @hidden 
     */ 
    handleTypes(value: patternValue | Pattern | string, t: number | null = null, round=true) : patternValue {
        if(value instanceof Pattern) return value.value()
        if(typeof value === 'string') return parsePattern(value, t || this._t, this._q, this._id, round)
        return value
    }

   /**
     * Return to parent Pattern or Stream
     * Useful when using any of the dollar methods, which spawn new Patterns, allowing you to return to this original pattern.
     * Or, use as shorthand to access the underlying stream
     * @returns {Pattern}
     * @example
     * s1.set({inst: 'synth', cut: 1})
     * s1.p.n.coin()
     *  .$if.set(57)._
     *  .$else.scales('d-dorian', 16)
     * s1.e.every(1)
     * @example
     * s0.x.set(8)._.y.set(8)
     */ 
    get _(): Pattern | Stream {
        return this._parent || this
    }

    /**
     * Pass the value of a pattern to a method on the previous pattern
     * @param pattern 
     * @param method 
     * @hidden
     */
    combine({pattern, method} : {pattern: Pattern, method: string}) {
        // @ts-ignore
        this[method] && this[method](pattern.value())
    }

    /** @hidden */
    reset() {
        this.stack = []
        this._value = 0

        // TODO: this is unfortunate as all Patterns stored here will be garbage collected rather than reused...
        this._state.$ = []
        return this
    }    

    /**
     * Set a single value
     * @param {patternable} value - a single string or number or array of strings or numbers, or a Pattern, or a Zen pattern string
     * @returns {Pattern}
     * @example s0.p.amp.set(1)
     * @example s1.e.set(s0.e)
     * @example s0.e.set('1?0*16')
     */
    set(value: patternable): Pattern {
        this.stack.push(t => this.handleTypes(value, +t))
        return this
    }

    /**
     * Trigger a value in pattern, only if it fall directly onto a division
     * Best used to trigger events or mutations
     * @param {patternable} value - a single string or number or array of strings or numbers, or a Pattern, or a Zen pattern string
     * @returns {Pattern}
     * @example 
     * // compare with s0.e.set('1*4')
     * s0.e.trigger('1*4')
     * @example s0.e.trigger('1*4')
     */ 
    trigger(value: patternable): Pattern {
        this.stack.push(t => this.handleTypes(value, +t, false))
        return this
    }
    


    /**
     * Inset another pattern's stack into the current pattern's stack
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.p.amp.sine()
    s1.p.pan.use(s0.p.amp);
     */
    use(pattern: Pattern): Pattern {
        this.stack.push(...pattern.stack)
        this._state.$.push(...pattern._state.$)
        return this
    }

    /**
     * Get the current value of pattern if it has been evaluated. Used internally.
     * @hidden
     */ 
    value(): patternValue {
        return this._value
    }

    /**
     * Negate the value passed as the first argument
     * @param {patternable} x - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example 
     * s0.e.every(3)
     * s1.e.not(s0.e)
     * s2.e.not(!(t%3))
     * s3.e.not('1?0*16')
     */ 
    not(x: patternable): Pattern {
        this.stack.push(() => this.handleTypes(x) ? 0 : 1)
        return this
    }

    /**
     * Instantiate a new Pattern and negate the outcome of the pattern
     * @returns {Pattern}
     * @example
     * s0.e.$not.square(0,1,1)
     */ 
    get $not(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'not', pattern})
        return pattern
    }

    /**
     * Toggle on or off using the value passed as the first argument
     * A true value will toggle the pattern on, a false value will toggle it off
     * @param {patternable} x - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example
     * s0.e.every(3)
     * s1.e.toggle(s0.e)
     * s2.e.toggle(!(t%3))
     * s3.e.toggle('1?0*16')
     */ 
    toggle(x: patternable): Pattern {
        this.stack.push(() => {
            if (this.handleTypes(x)) this._state.toggle = !this._state.toggle
            return this._state.toggle ? 1 : 0
        })
        return this
    }

    /**
     * See toggle.
     * @returns {Pattern}
     */ 
    get $toggle(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'toggle', pattern})
        return pattern
    }

    // CONDITIONALS
    /**
     * Test if the previous value in the pattern chain is a truthy or falsy value
     * If true return new value, if false, simply pass on the previous value
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     */ 
    if(value: patternable): Pattern {
        this.stack.push(x => [x].flat().every(x => !!x) ? this.handleTypes(value) : x)
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is a truthy or falsy value
     * If true return outcome of pattern
     * @returns {Pattern}
     * @example 
     * s0.x.coin().$if.set(4)._.$else.set(12)
     * s0.e.set(1)
     */ 
    get $if(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'if', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is a truthy or falsy value
     * If false return new value, if true, simply pass on the previous value
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     */ 
    else(value: patternable): Pattern {
        this.stack.push(x => [x].flat().every(x => !x) ? this.handleTypes(value) : x)
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is a truthy or falsy value
     * If false return outcome of pattern
     * @returns {Pattern}
     * @example
     * s0.x.coin().$if.set(4)._.$else.set(12)
     * s0.e.set(0)
     */ 
    get $else(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'else', pattern})
        return pattern
    }

    // MATHS
    /**
     * Add a value to the previous value in the pattern chain.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).add(12)
     * @example s0.p.n.noise(60,72,1).add('0?12*16')
     */
    add(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x + +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and add the result to the previous value in the pattern chain
     * @example s0.p.n.noise(60,72,1).$add.noise(0,12,1)
     * @returns {Pattern}
     */
    get $add(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'add', pattern})
        return pattern
    }

    /**
     * Subtract a value from the previous value in the pattern chain.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).sub(12)
     */
    sub(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x - +this.handleTypes(value)))
        return this
    }    

    /**
     * Instantiate a new Pattern and subtract the result from the previous value in the pattern chain
     * @example s0.p.n.noise(60,72,1).$sub.noise(0,12,1)
     * @returns {Pattern}
     */ 
    get $sub(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'sub', pattern})
        return pattern
    }

    /**
     * Reverse subtract. Subtract the previous value in the pattern chain from a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.amp.noise(0.5,0.25).subr(1)
     */
    subr(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => +this.handleTypes(value) - x))
        return this
    }

    /**
     * Instantiate a new Pattern and subtract the previous value in the pattern chain
     * @example s0.p.n.noise(0,12,1).$subr.noise(60,72,1)
     * @returns {Pattern}
     */ 
    get $subr(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'subr', pattern})
        return pattern
    }

    /**
     * Multiply the previous value in the pattern chain by a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).mul(2)
     */ 
    mul(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x * +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and multiply the previous value in the pattern chain
     * @example s0.p.n.noise(60,72,1).$mul.noise(0,12,1)
     * @returns {Pattern}
     */ 
    get $mul(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'mul', pattern})
        return pattern
    }

    /**
     * Divide the previous value in the pattern chain by a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).div(2)
     * Or, use $div to create a new pattern and divide it by the previous pattern in the chain.
     * @example s0.p.n.noise(60,72,1).$div.noise(0,12,1)
     */
    div(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x / +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and divide the previous value in the pattern chain
     * @example s0.p.n.noise(60,72,1).$div.noise(0,12,1)
     * @returns {Pattern}
     */ 
    get $div(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'div', pattern})
        return pattern
    }

    /**
     * Reverse divide the previous value in the pattern chain by a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.modi.noise(1,2).divr(2)
     * Or, use $divr to create a new pattern and divide it by the previous pattern in the chain.
     * @example s0.p.n.noise(0,12,1).$divr.noise(60,72,1)
     */ 
    divr(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => +this.handleTypes(value) / x))
        return this
    }   

    /**
     * Instantiate a new Pattern and divide the previous value in the pattern chain
     * @example s0.p.n.noise(0,12,1).$divr.noise(60,72,1)
     * @returns {Pattern}
     */ 
    get $divr(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'divr', pattern})
        return pattern
    }

    /**
     * Modulo the previous value in the pattern chain by a value.
     * Or, use $mod to pass the outcome of a pattern to the function
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.n.set(t).mod(12).add(36)
     * @example s0.n.set(t).$mod.set(12)
     */ 
    mod(value: patternable): Pattern {
        this.stack.push(x => {
            const m = +this.handleTypes(value)
            return handlePolyphony(x, x => ((x % m) + m) % m)
        })
        return this
    }

    /**
     * Instantiate a new Pattern and modulo the previous value in the pattern chain
     * @example s0.p.n.noise(0,12,1).$mod.noise(60,72,1)
     * @returns {Pattern}
     */ 
    get $mod(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'mod', pattern})
        return pattern
    }    
    
    // COMPARISON
    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).add(t%2)
     * Or, use $and to create a new pattern and compare it with the previous pattern in the chain.
     * @example s0.e.every(3).$and.every(2)
     */ 
    and(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x && +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and compare the previous value in the pattern chain with a value.
     * @return {Pattern}
     * @example s0.e.every(3).$and.every(2)
     */ 
    get $and(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'and', pattern})
        return pattern
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).or(t%2)
     */ 
    or(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x || +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and compare the previous value in the pattern chain with a value.
     * @return {Pattern}
     * @example s0.e.every(3).$or.every(2)
     */ 
    get $or(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'or', pattern})
        return pattern
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param {patternable} value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).xor(t%2)
     */ 
    xor(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x ^ +this.handleTypes(value)))
        return this
    }

    /**
     * Instantiate a new Pattern and compare the previous value in the pattern chain with a value.
     * @return {Pattern}
     * @example s0.e.every(3).$xor.every(2)
     */ 
    get $xor(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'xor', pattern})
        return pattern
    }

    // Generators
    /**
     * Generate a range of values between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.range(0, 10, 1, 2)
     */
    range(...args: patternable[]): Pattern {
        this.stack.push((x: patternValue) => {
            const [lo=0, hi=1, step=0, freq=1] = args.map(arg => this.handleTypes(arg))
            return mapToRange(pos(x, this._q, +freq), 0, 1, +lo, +hi, +step)
        })
        return this
    }

    /**
     * Generate a sine wave between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.sine(0, 10)
     */
    sine(...args: number[]): Pattern {
        this.stack.push((x: patternValue) => {
            const [lo=0, hi=1, step=0, freq=1] = args.map(arg => this.handleTypes(arg))
            const radians = pos(x, this._q, +freq) * 360 * (Math.PI/180)
            const sin = Math.sin(radians)
            return mapToRange(sin, -1, 1, +lo, +hi, +step)
        })
        return this
    }

    /**
     * Generate a cosine wave between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.cosine(0, 10)
     */
    cosine(...args: number[]): Pattern {
        this.stack.push((x: patternValue) =>  {
            const [lo=0, hi=1, step=0, freq=1] = args.map(arg => this.handleTypes(arg))
            const radians = pos(x, this._q, +freq) * 360 * (Math.PI/180)
            const cos = Math.cos(radians)
            return mapToRange(cos, -1, 1, +lo, +hi, +step)
        })
        return this
    }

    /**
     * Generate a saw wave between lo and hi. Alias of range. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.saw(0, 10)
     */
    saw(...args: number[]): Pattern {
        return this.range(...args)
    }

    /**
     * Generate a curve between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} curve curve of the pattern. Default is 0.5, which means a linear curve.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     */
    curve(...args: patternable[]): Pattern {
        this.stack.push((x: patternValue) => {
            const [lo=0, hi=1, curve=0.5, freq=1] = args.map(arg => this.handleTypes(arg))
            const value = Math.pow(pos(x, this._q, +freq), +curve) 
            return mapToRange(value, 0, 1, +lo, +hi)
        })
        return this
    }
    
    /**
     * Generate a triangle wave between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.harm.tri(0, 4, 0.25)
     */
    tri(...args: patternable[]): Pattern {
        this.stack.push((x: patternValue) => {
            const [lo=0, hi=1, step=0, freq=1] = args.map(arg => this.handleTypes(arg))
            const tri = Math.abs(pos(x, this._q, +freq) - 0.5) * 2
            return mapToRange(tri, 0, 1, +lo, +hi, +step)
        })
        return this
    }

    /**
     * Generate a pulse wave between lo and hi. Use as the first call in a pattern chain.
     * @param {patternable} lo - lowest value in range
     * @param {patternable} hi - highest value in range
     * @param {patternable} width - width of the pulse. Default is 0.5, which means a square wave.
     * @param {patternable} freq - number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.pulse(0, 10, 0.25)
    */
    pulse(...args: patternable[]): Pattern {
        this.stack.push((x: patternValue) => {
            const [lo=0, hi=1, width=0.5, freq=1] = args.map(arg => this.handleTypes(arg))
            const pulse = (((pos(x, this._q, +freq))%1) < +width ? 1 : 0)
            return mapToRange(pulse, 0, 1, +lo, +hi)
        })
        return this
    }

    /**
     * Generate a square wave between lo and hi. Use as the first call in a pattern chain. See also pulse.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.square(0, 10)
    */
    square(lo=0, hi=1, freq=1): Pattern {
        this.pulse(lo, hi, 0.5, freq)
        return this
    }

    /**
     * Generate a random number between lo and hi.
     * @param {patternable} lo lowest value in range
     * @param {patternable} hi highest value in range
     * @param {patternable} step step size to round the output. Default is 0, which means no rounding.
     * @returns {Pattern}
     * @example s0.p.n.random(60,72,1)
     */
    random(...args: patternable[]): Pattern {
        this.stack = [() => {
            const [lo=0, hi=1, step=0] = args.map(arg => this.handleTypes(arg))
            return mapToRange(Math.random(), 0, 1, +lo, +hi, +step)
        }]
        return this
    }

    /**
     * Generate a number between lo and hi, using a simplex noise function.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param cycles number of cycles of the pattern. Default is 4.
     * @returns {Pattern}
     * @example s0.p.pan.noise(0, 1)
    */
    noise(...args: patternable[]): Pattern {
        this.stack = [(x: patternValue) => {
            const [lo=0, hi=1, step=0, freq=1, cycles=4] = args.map(arg => this.handleTypes(arg))
            return mapToRange(noise.simplex2(pos(x, this._q, +freq, +cycles), 0), -1, 1, +lo, +hi, +step)
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
    every(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return !(+x % +n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and generate truthy or falsy values every n divisions, where n is a number generated by the new Pattern.
     * @returns {Pattern}
     * @example s0.p.$every.sine(1,16,1)
     */ 
    get $every(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'every', pattern})
        return pattern
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
    bin(n: string = '10000000', ...rest: patternable[]): Pattern {
        const arr = n.replace(/\s+/g, '').split('').map(x => !!parseInt(x))
        
        this.stack = [(x: patternValue) => {
            const [freq=1, a=1, b=0] = rest.map(arg => this.handleTypes(arg))
            const divisions = this._q / +freq
            const result = arr[ (+x%divisions) / (divisions/arr.length) ] ? a : b
            return result
        }]
        return this
    }

    /**
     * Convert a number to binary string, then passes it to .bin().
     * @param n a number
     * @param q the length of the binary string
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.ntbin(9, 8) // 9 in binary is 1001, padded out to 8 digits. Passes 00001001 to .bin()
     */
    ntbin(n: patternable = 0, q: number = 8, freq: patternable = 1, a: patternable = 1, b: patternable = 0): Pattern {
        return this.bin(numberToBinary(+n, q), freq, a, b)
    }

    /**
     * Choose from a sequence of values. Use as the first call in a pattern chain.
     * @param values an array of values
     * @param freq number of iterations of the sequence, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.n.seq([60,72,74,76])
     */
    seq(values: number[] = [], freq: patternable = 1): Pattern {
        this.stack.push((x: patternValue) => {
            const f = this.handleTypes(freq)
            return values[Math.floor((pos(x, this._q, +f)*values.length)%values.length)]
        })
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
     * Instantiate a new Pattern and round the previous value in the pattern chain to the step value, where the step value is a number generated by the new Pattern.
     * @returns {Pattern}
     * @example s0.p.n.noise(0,1).$step.noise(0,12,1)
     */ 
    get $step(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'step', pattern})
        return pattern
    }

    /**
     * Round the previous value in the pattern chain to the nearest value in an array.
     * @param array array of values to round to
     * @returns {Pattern}
     * @example s0.p.n.noise(0,12).tune([0,2,4,5,7,9,11,12]).add(36)
     */ 
    tune(array: patternable): Pattern {
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
     * Instantiate a new Pattern and round the previous value in the pattern chain to the nearest value in an array, where the array is generated by the pattern.
     * Best used with .scales() or .chords() methods
     * @returns {Pattern}
     * @example s0.p.n.noise(0,24).$tune.scales('c-major', 16, 0).add(36)
     */ 
    get $tune(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'tune', pattern})
        return pattern
    }

    /**
     * Clamp the previous value in the pattern chain to a range.
     * @param min minimum value
     * @param max maximum value
     * @returns {Pattern}
     */ 
    clamp(...args: patternable[]): Pattern {
        this.stack.push(x => { 
            const [min=0, max=1] = args.map(arg => this.handleTypes(arg))
            return handlePolyphony(x, x => clamp(x, +min, +max))
        })
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
    gt(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x > +n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is greater than the Pattern's value.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$gt.square(0,12)
     */ 
    get $gt(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'gt', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is less than a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    lt(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x < +n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is less than the Pattern's value.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$lt.square(0,12)
     */ 
    get $lt(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'lt', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is greater than or equal to a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.p.n.noise(0,1).gte(0.3, 60, 72)
     */ 
    gte(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x >= +n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is greater than or equal to the Pattern's value.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$gte.square(0,12)
     */ 
    get $gte(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'gte', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is less than or equal to a value.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */
    lte(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x <= +n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is less than or equal to the Pattern's value.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$lte.square(0,12)
     */ 
    get $lte(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'lte', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is equal to a value using ==.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    eq(...args: patternable[]): Pattern {
        this.stack.push(x => { 
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x == n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is equal to the Pattern's value, using ==.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$eq.square(0,12)
     */ 
    get $eq(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'eq', pattern})
        return pattern
    }

    /**
     * Test if the previous value in the pattern chain is not equal to a value using !=.
     * @param value value to test against
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    neq(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [n=1, a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(x => x != n) ? a : b
        })
        return this
    }

    /**
     * Instantiate a new Pattern and test if the previous value in the pattern chain is not equal to the Pattern's value, using !=.
     * @returns {Pattern}
     * @example s0.e.noise(0,16).$neq.square(0,12)
     */ 
    get $neq(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'neq', pattern})
        return pattern
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
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    odd(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(odd) ? a : b
        })
        return this
    }

    /**
     * Test if the previous value in the pattern chain is an even number
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     */ 
    even(...args: patternable[]): Pattern {
        this.stack.push(x => {
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return [x].flat().every(even) ? a : b
        })
        return this
    }
    
    /**
     * Convert the previous value from beats to seconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.p.dur(1).bts().mul(1000)
     */ 
    bts(): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x * (60/this._bpm)))
        return this
    }

    /**
     * Convert the previous value from beats to milliseconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.p.dur(1).btms()
     */ 
    btms(): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x * (60000/this._bpm)))
        return this
    }

    /**
     * Convert the previous value from divisions of a bar to seconds, scaling by bpm
     * @returns {Pattern}
     * @example s0.p.set(q).ttms()
     */
    ttms(): Pattern {
        this.stack.push(x => handlePolyphony(x, x =>  x * (((60000/this._bpm) * 4) / this._q)))
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
     * @param asArray return the entire scale as an array. Default is false.
     * @returns {Pattern}
     * @example s0.p.n.scales('c-dorian', 16)
     */ 
    // TODO: can we replace this with a pattern string?
    scales(names: string | string[], length: number = 8, freq: number = 1, asArray: boolean = false): Pattern {
        const scales = [names].flat().map(name => {
            const scale = getScale(name)
            return scale.slice(0, min(length, scale.length))
        })
        this.seq(asArray ? scales : scales.flat(), freq).add(48)
        return this
    }

    /**
     * Use the previous value in the pattern chain as an index to retrieve a chord from an array of musical chords
     * @param names name of chord or array of chord names. Chords follow root-chord format, e.g. 'd-min7'.
     * @param octave octave to start chord. Default is 4.
     * @todo show link to available chords
     * @param freq number of iterations of the pattern
     * @returns {Pattern}
     * @example s0.p.n.chords(['d-min7', 'g-dom7'])
     */ 
    // TODO: can we replace this with a pattern string?
    chords(names: string | string[], freq: number = 1, octave: number = 4): Pattern {
        this.seq([names].flat().map(name => getChord(name)), freq).add(octave * 12)
        return this
    }

    /**
     * Invert the previous chord in the pattern chain
     * @param n inversion
     * @returns {Pattern}
     * @example s0.p.n.chords('d-dorian', 16).inversion(1)
     * @example s0.p.n.chords('d-dorian', 16).$inversion.range(0,8,1)
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
     * Get a value from the previous value in the pattern chain, at index n
     * Expects the previous value to be an array
     * @param n index of value to retrieve
     * @returns {Pattern}
     * @example s0.p.n.scales('d-dorian',16,1,1).at(t%16)
     */ 
    at(n: patternable): Pattern {
        this.stack.push(x => [x].flat()[+this.handleTypes(n)])
        return this
    }

    /**
     * Instantiate a new Pattern and use the resulting value to get a value from the previous value in the pattern chain, at index n
     * Expects the previous value to be an array
     * @returns {Pattern}
     * @example s0.p.n.scales('d-dorian',16,1,1).$at.saw(0,16,1)
     */ 
    get $at(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'at', pattern})
        return pattern
    }
    
    /**
     * Layer a value on top of the previous value in the pattern chain, forming an array of values
     * @param n 
     * @returns 
     * @example s0.p.n.scales('d-dorian',16).layer(12)
     */
    layer(n: patternable): Pattern {
        this.stack.push(x => [x].flat().concat(this.handleTypes(n)))
        return this
    }

    /**
     * Instantiate a new Pattern and use the resulting value to layer a value on top of the previous value in the pattern chain, forming an array of values
     * @returns {Pattern}
     * @example s0.p.n.scales('d-dorian',16).$layer.scales('f-lydian',16)
     */ 
    get $layer(): Pattern {
        const pattern = new Pattern(this)
        this._state.$.push({method: 'layer', pattern})
        return pattern
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
     * Multiply the previous value in the pattern chain to the power of a given value
     * @param exponent value to multiply by
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
     * @example s0.y.sine(0,15,1).$intrp.sine(15,0,1,0.5)
     */ 
    interpolate(val: patternable): Pattern {
        this.stack.push((x: patternValue) => handlePolyphony(x, x => interpolate(+x, +this.handleTypes(val), 0.5)))
        return this
    }

    // Chance
    /**
     * 50/50 chance of returning 1 or 0. Also, use `coin()`.
     * @param a value to return if true
     * @param b value to return if false
     * @returns {Pattern}
     * @example
     * s0.e.sometimes()
     */ 
    sometimes(...args: patternable[]): Pattern {
        this.stack.push(() => {
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return Math.random() < 0.5 ? a : b
        })
        return this
    }

    /**
     * Alias for `sometimes`
     */ 
    coin(...args: patternable[]): Pattern {
        this.stack.push(() => { 
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return Math.random() < 0.5 ? a : b
        })
        return this
    }  

    /**
     * 25/75 chance of returning 1 or 0
     * @param a value to return if true
     * @param b value to return if false
     * @returns {Pattern}
     * @example
     * s0.e.rarely()
     */ 
    rarely(...args: patternable[]): Pattern {
        this.stack.push(() => {
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return Math.random() < 0.25 ? a : b
        })
        return this
    }

    /**
     * 75/25 chance of returning a 1 or 0
     * @param a value to return if true
     * @param b value to return if false
     * @returns {Pattern}
     * @example
     * s0.e.often()
     */ 
    often(...args: patternable[]): Pattern {
        this.stack.push(() => {
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return Math.random() < 0.75 ? a : b
        })
        return this
    }

    /** @hidden */
    get(t: number, q: number, bpm?: number): patternValue | null {
        this._t = t
        this._q = q
        this._bpm = bpm || this._bpm

        // evaluate all $ patterns stored in the state
        this._state.$.forEach(({pattern} : {pattern: Pattern}) => pattern.get(t, q, bpm))
        // combine all $ patterns into the stack
        this._state.$.forEach(this.combine)
        
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