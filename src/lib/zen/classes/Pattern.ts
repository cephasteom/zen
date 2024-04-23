import { get } from 'svelte/store';
import { nanoid } from 'nanoid'
import type { Stream } from './Stream'
import type { stack, patternValue, patternable } from '../types'
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
    handleArrayOrSingleValue as handlePolyphony
} from '../utils/utils';
import { parsePattern } from '../parsing/mininotation';
import { noise, randomSequence } from '../stores'
import { getCC, getNotes } from '../stores/midi'
import { circuit } from './Circuit'

const channel = new BroadcastChannel('zen')

/**
 * Patterns are the building blocks of Zen. They are used to generate patterns of values in interesting, concise ways. 
 * Pattern methods can be chained together.
 * Pattern methods can be prefixed with a $ to create a new pattern; for example, $add. The results of each pattern are combined together.
 * @example
 * s0.p.amp.range(0,1)
 * s0.px.drive.sine(0,1)
 * s0.py.modi.range(0,10).mul((t%q)/q)
 * s0.e.every(3).$and.every(4)
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
    private _measurements: number[] = [0,0,0,0,0,0,0,0]

    /** @hidden */
    private _probabilities: number[] = [0,0,0,0,0,0,0,0]

    /**
     * State object for pattern methods that require it
     * Clears on reset()
     * @hidden
     */
    private _state = {} as any

    /**
     * State object for pattern methods that require it
     * Does not clear on reset()
     * @hidden
     */
    private _statePersist = {} as any

    /**
     * Shorthand aliases for pattern methods.
     * @example
     * 
a: 'add',
an: 'and',
b: 'bin',
bm: 'btms',
bs: 'bts',
cl: 'clamp',
c: 'coin',
cc: 'midicc',
co: 'cosine',
cu: 'curve',
d: 'div',
dr: 'divr',
e: 'else',
eq: 'eq',
ev: 'every',
i: 'if',
intrp: 'interpolate',
inv: 'inversion',
in: 'invert',
la: 'layer',
mo: 'mod',
m: 'mul',
n: 'not',
no: 'noise',
nb: 'ntbin',
o: 'or',
of: 'often',
pu: 'pulse',
rd: 'random',
ra: 'range',
r: 'rarely',
sa: 'saw',
se: 'seq',
v: 'set',
si: 'sine',
sq: 'square',
st: 'step',
so: 'sometimes',
s: 'sub',
sr: 'subr',
t: 'toggle',
tr: 'tri',
trig: 'trigger',
tu: 'tune',
u: 'use',
x: 'xor'
    */ 
    aliases = {
        a: 'add',
        an: 'and',
        b: 'bin',
        bm: 'btms',
        bs: 'bts',
        cl: 'clamp',
        c: 'coin',
        cc: 'midicc',
        co: 'cosine',
        cu: 'curve',
        d: 'div',
        dr: 'divr',
        e: 'else',
        eq: 'eq',
        ev: 'every',
        i: 'if',
        intrp: 'interpolate',
        inv: 'inversion',
        in: 'invert',
        la: 'layer',
        mo: 'mod',
        m: 'mul',
        n: 'not',
        no: 'noise',
        nb: 'ntbin',
        o: 'or',
        of: 'often',
        pu: 'pulse',
        rd: 'random',
        ra: 'range',
        r: 'rarely',
        sa: 'saw',
        se: 'seq',
        v: 'set',
        si: 'sine',
        sq: 'square',
        st: 'step',
        so: 'sometimes',
        s: 'sub',
        sr: 'subr',
        t: 'toggle',
        tr: 'tri',
        trig: 'trigger',
        tu: 'tune',
        u: 'use',
        x: 'xor',
    }

    rng(t: number) {
        return get(randomSequence)[t % 256] || Math.random()
    }

    /** @hidden */
    constructor(parent: Pattern | Stream | null = null, isTrigger=false) {
        this._id = nanoid()
        this._parent = parent
        this.reset()
        isTrigger && (this.set = this.trigger)

        // handle dollar methods
        Object.getOwnPropertyNames(Pattern.prototype).forEach(method => {
            Object.defineProperty(this, `$${method}`, {
                get: () => {
                    const pattern = new Pattern(this, ['and', 'or', 'xor', 'not'].includes(method))
                    // @ts-ignore
                    this[method](pattern)
                    return pattern
                },
            })
        })
            
        // handle aliases
        return new Proxy(this, {
            get: (target, prop) => {
                // @ts-ignore
                if (prop in target) return target[prop]

                const isDollarMethod = prop.toString().startsWith('$')
                const p = prop.toString().replace('$', '')
                // @ts-ignore
                const name = (isDollarMethod ? '$' : '') + this.aliases[p] || p
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
        if(value instanceof Pattern) return value.get(t || this._t, this._q, this._bpm) || 0
        if(typeof value === 'function') return value(t || this._t, this._q)
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
     *  .$else.set('Ddor..*16')
     * s1.e.every(1)
     * @example
     * s0.x.set(0.5)._.y.set(0.5)
     */ 
    get _(): Pattern | Stream {
        return this._parent || this
    }

    /** @hidden */
    reset() {
        this.stack = []
        this._value = 0
        this._state = {}
        return this
    }   
    
    /**
     * Return the current time
     * @example 
     * s0.x.t().mul(2)
     * @returns {Pattern}
     */
    t(): Pattern {
        this.stack.push(t => t)
        return this
    }

    /**
     * Return the current cycle
     * @example 
     * s0.e.v(1)
     * s0.x.c()
     * @returns {Pattern}
     */
    c(): Pattern {
        this.stack.push(() => Math.floor(this._t / this._q))
        return this
    }

    /**
     * Set a single value
     * @param value - a single string or number or array of strings or numbers, or a Pattern, or a Zen pattern string
     * @returns {Pattern}
     * @example s0.p.amp.set(1)
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
     * Inset another pattern's stack into the current pattern's stack
     * @param {Pattern} pattern - an instance of another pattern
     * @returns {Pattern}
     * @example 
    s0.p.amp.sine()
    s1.p.pan.use(s0.p.amp);
     */
    use(pattern: Pattern): Pattern {
        this.stack.push(...pattern.stack)
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
     * @param x - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example 
     * s0.e.every(3)
     * s1.e.not(s0.e)
     * s2.e.not(!(t%3))
     * s3.e.not('1?0*16')
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
     * On/off. Returns 1 when on, 0 when off.
     * True values passed to the first argument will turn the pattern on, false values are ignored.
     * True values passed to the second argument will turn the pattern off, false values are ignored.
     * @param on - a value, instance of Pattern, or Zen pattern string
     * @param off - a value, instance of Pattern, or Zen pattern string
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
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     */ 
    if(value: patternable): Pattern {
        this.stack.push(x => [x].flat().every(x => !!x) ? this.handleTypes(value) : x)
        return this
    }

    /**
     * Test if the previous value in the pattern chain is a truthy or falsy value
     * If false return new value, if true, simply pass on the previous value
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     */ 
    else(value: patternable): Pattern {
        this.stack.push(x => [x].flat().every(x => !x) ? this.handleTypes(value) : x)
        return this
    }

    // MATHS
    /**
     * Map the preceding value in the chain to a new range.
     * @param outMin - the new minimum value
     * @param outMax - the new maximum value 
     * @param inLo - the minimum value of the input range. Default is 0.
     * @param inHi - the maximum value of the input range. Default is 1.
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
     * @example s0.p.n.noise(60,72,1).add(12)
     * @example s0.p.n.noise(60,72,1).add('0?12*16')
     */
    add(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x + +this.handleTypes(value)))
        return this
    }

    /**
     * Subtract a value from the previous value in the pattern chain.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).sub(12)
     */
    sub(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x - +this.handleTypes(value)))
        return this
    }    

    /**
     * Reverse subtract. Subtract the previous value in the pattern chain from a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.amp.noise(0.5,0.25).subr(1)
     */
    subr(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => +this.handleTypes(value) - x))
        return this
    }

    /**
     * Multiply the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.p.n.noise(60,72,1).mul(2)
     */ 
    mul(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x * +this.handleTypes(value)))
        return this
    }

    /**
     * Divide the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
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
     * Reverse divide the previous value in the pattern chain by a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
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
     * Modulo the previous value in the pattern chain by a value.
     * Or, use $mod to pass the outcome of a pattern to the function
     * @param  value - a value, instance of Pattern, or Zen pattern string
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
    
    // COMPARISON
    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).add(t%2)
     * Or, use $and to create a new pattern and compare it with the previous pattern in the chain.
     * @example s0.e.every(3).$and.every(2)
     */ 
    and(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x && +this.handleTypes(value, this._t, false)))
        return this
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param  value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).or(t%2)
     */ 
    or(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x || +this.handleTypes(value, this._t, false)))
        return this
    }

    /**
     * Compare the previous value in the pattern chain with a value.
     * @param value - a value, instance of Pattern, or Zen pattern string
     * @returns {Pattern}
     * @example s0.e.every(3).xor(t%2)
     */ 
    xor(value: patternable): Pattern {
        this.stack.push(x => handlePolyphony(x, x => x ^ +this.handleTypes(value, this._t, false)))
        return this
    }

    // Generators
    /**
     * Generate a range of values between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param step step size to round the output. Default is 0, which means no rounding.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.saw(0, 10)
     */
    saw(...args: number[]): Pattern {
        return this.range(...args)
    }

    /**
     * Generate a curve between lo and hi. Use as the first call in a pattern chain.
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param curve curve of the pattern. Default is 0.5, which means a linear curve.
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     */
    curve(lo: patternable, hi: patternable, curve: patternable, freq: patternable ): Pattern {
        this.stack.push((x: patternValue) => {
            const value = Math.pow(pos(x, this._q, +this.handleTypes(freq)), +this.handleTypes(curve)) 
            return mapToRange(value, 0, 1, +this.handleTypes(lo), +this.handleTypes(hi))
        })
        return this
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
     * @param lo - lowest value in range
     * @param hi - highest value in range
     * @param width - width of the pulse. Default is 0.5, which means a square wave.
     * @param freq - number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
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
     * @param lo lowest value in range
     * @param hi highest value in range
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @returns {Pattern}
     * @example s0.p.modi.square(0, 10)
    */
    square(lo=0, hi=1, freq=1): Pattern {
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
    random(...args: patternable[]): Pattern {
        this.stack = [() => {
            const [lo=0, hi=1, step=0] = args.map(arg => this.handleTypes(arg))
            return mapToRange(this.rng(this._t), 0, 1, +lo, +hi, +step)
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
            return mapToRange(get(noise).simplex2(pos(x, this._q, +freq, +cycles), 0), -1, 1, +lo, +hi, +step)
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
     * Generate truthy or falsy values from a binary string.
     * @param n binary string
     * @param freq number of iterations of the pattern, either per cycle or per canvas. Default is 1, which means once per cycle.
     * @param a value to return when true
     * @param b value to return when false
     * @returns {Pattern}
     * @example s0.e.bin('1111') // output depends on the number of division per cycle / canvas. If 16, returns 1 every 4 divisions, 0 otherwise
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
     * Invert the previous chord in the pattern chain
     * @param n inversion
     * @returns {Pattern}
     * @example s0.p.n.set('Cmi7').inversion(1)
     * @example s0.p.n.set('Cmi7').$inversion.range(0,8,1)
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
     * The previous value can be either an array - so n must be an integer...
     * ...or an object - so n must be a string
     * @param n index of value to retrieve
     * @returns {Pattern}
     * @example s0.p.n.set('Ddor%16').at(t%16)
     */ 
    at(n: patternable): Pattern {
        this.stack.push(data => {
            const type = typeof data
            const key = this.handleTypes(n)
            return type === 'object'
                // @ts-ignore
                ? data[key] 
                // @ts-ignore
                : data[Math.floor(+key) % data.length]
        })
        return this
    }
    
    /**
     * Layer a value on top of the previous value in the pattern chain, forming an array of values
     * @param n 
     * @returns 
     * @example s0.p.n.set('Ddor%16..*16').layer(62)
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
     * @example s0.y.sine().$intrp.sine(1,0,0,0.5)
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
            return this.rng(this._t) < 0.5 ? a : b
        })
        return this
    }

    /**
     * Alias for `sometimes`
     */ 
    coin(...args: patternable[]): Pattern {
        this.stack.push(() => { 
            const [a=1, b=0] = args.map(arg => this.handleTypes(arg))
            return this.rng(this._t) < 0.5 ? a : b
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
            return this.rng(this._t) < 0.25 ? a : b
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
            return this.rng(this._t) < 0.75 ? a : b
        })
        return this
    }

    /**
     * Use a midi cc on the selected device
     * @param cc control change number
     * @param device midi device index (default is 0)
     * @param value initial value (default is 1)
     * @returns {Pattern}
     * @example s0.p.vol.midicc(1,0.5,0)
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
     * @example s0.p.n.midinote()
     */
    midinote(device: patternable): Pattern {
        this.stack.push(() => getNotes(+this.handleTypes(device)))
        return this
    }

    /**
     * Returns a 1 the first time it is called, and 0 thereafter
     * @returns {Pattern}
     * @example s0.e.once()
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
     * Return the value of the measured qubit
     * @returns {Pattern}
     * @example s0.e.measure(0)
     * @param qubit qubit to measure
     */
    measure(qubit: patternable = 0, offset: patternable = 0): Pattern {
        this.stack.push(() => {
            const i = +this.handleTypes(qubit)
            const useState = +this.handleTypes(offset)
            const current = this._measurements[i] || 0
            const previous = this._statePersist.measure || 0
            this._statePersist.measure = current
            return useState
                ? previous
                : current
        })
        return this
    }

    /**
     * Return the probability of the qubit being measured as 1
     * @returns {Pattern}
     * @example s0.x.pb(0)
     * @param qubit qubit to query the probability of
     */
    pb(qubit: patternable = 0, offset: patternable = 0): Pattern {
        this.stack.push(() => {
            const i = +this.handleTypes(qubit)
            const useState = +this.handleTypes(offset)
            const current = this._probabilities[i] || 0
            console.log(current, i)
            const previous = this._statePersist.probability || 0
            this._statePersist.probability = clamp(current, 0, 1)
            return useState
                ? previous
                : current
        })
        return this
    }

    /**
     * Post the current value to the console
     * @returns 
     */
    print(): Pattern {
        this.stack.push(x => {
            channel.postMessage({type: 'pattern', message: x})
            return x
        })
        return this
    }

    /** @hidden */
    get(
        t: number, q: number, bpm?: number,
        measurements?: number[], probabilities?: number[]
    ): patternValue | null {
        this._t = t
        this._q = q
        this._bpm = bpm || this._bpm
        this._measurements = measurements || []
        this._probabilities = probabilities || []

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