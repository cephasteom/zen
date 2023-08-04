import { Pattern } from './Pattern'
import type { Zen } from './Zen'
import { mod } from '../utils/utils'
import { formatEventParams, formatMutationParams } from '../utils/syntax';
import type { Dictionary } from '../types'

/**
 * A stream is a collection of patterns that can be mapped across time and space. A stream's position can be moved around time and space. When a stream triggers an event, musical parameters are determined by the stream's position in time and space. Similarly, when a stream mutates an event, all active events are mutated based on the stream's position in time and space.
 * 
 * Streams are available within your code as `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7`.
 * @example
 * s0.set({inst: 'synth', n: 60}) // set the stream's default parameters
 * s0.p.lag.set(1).btms()
 * s0.px._modi.saw(1,10) // map the synth's modulation index across the x axis
 * s0.py._harm.range(0,10,1) // map the synth's harmonic series across the y axis
 * s0.x.range(0,16,1) // move the stream across the x axis of the canvas
 * s0.y.noise(0,16,1,0.5) // move the stream across the y axis of the canvas
 * s0.e.every(4) // trigger a middle C every 4 divisions
 * s0.m.eval(s0.e).neq(1)
 */ 
export class Stream {
    /** @hidden */
    id: string

    /** @hidden */
    _t: number = 0
    
    /** @hidden */
    _e: boolean = false

    /** @hidden */
    _m: boolean = false

    /** @hidden */
    _solo: boolean = false

    /** @hidden */
    _mute: boolean = false
    
    /**
     * Patterns to be mapped across time
     * @example
     * s0.p.amp.range(0,1) // ramp amp from 0 to 1 across the cycle
     */ 
    p

    /**
     * Patterns to be mapped across the x axis
     * @example
     * s0.px.amp.range(0,1) // ramp amp from 0 to 1 across the x axis of the canvas
     */ 
    px

    /**
     * Patterns to be mapped across the y axis
     * @example
     * s0.py.amp.range(0,1) // ramp amp from 0 to 1 across the y axis of the canvas
     */ 
    py

    /**
     * Patterns to be mapped across the z axis
     * @example
     * s0.pz.amp.range(0,1) // ramp amp from 0 to 1 across the z axis of the canvas
     */ 
    pz
    
    /**
     * A Pattern for setting the stream's position in time
     * @example
     * s0.t.sine(0,16,1) // override the global t with a sine wave between 0 and 16
     */ 
    t = new Pattern()

    /**
     * A Pattern for setting the stream's position in space
     * @example
     * s0.x.saw(0,16,1) // move the stream across the x axis of the canvas with a saw wave between 0 and 16
     */ 
    x = new Pattern()

    /**
     * A Pattern for setting the stream's position in space
     * @example
     * s0.y.saw(0,16,1) // move the stream across the y axis of the canvas with a saw wave between 0 and 16
     */ 
    y = new Pattern()

    /**
     * A Pattern for setting the stream's position in space
     * @example
     * s0.z.saw(0,16,1) // move the stream across the z axis of the canvas with a saw wave between 0 and 16
     */ 
    z = new Pattern()

    /**
     * A Pattern for setting all axes of the stream's position at the same time. Expects an array of values
     * @example
     * s0.xyz.set([t,8,0])
     */ 
    xyz = new Pattern()

    /**
     * A Pattern for determining whether the stream should trigger an event
     * @example
     * s0.e.set(1) // trigger an event every division
     * s0.e.every(4) // trigger an event every 4 divisions
     * s0.e.bin('1000 1001') // use a binary pattern to trigger events
     */ 
    e = new Pattern()

    /**
     * A Pattern for determining whether to mutate all active events in the stream. Only mutates parameters prefixed with `_`, e.g. `_amp`
     * @example
     * s0.m.set(1) // mutate all active events every division
     * s0.m.every(4) // mutate all active events every 4 divisions
     */ 
    m = new Pattern()

    /**
     * A Pattern for determining whether to mute the stream
     * @example
     * s0.mute.set(1) // mute the stream every division
     * s0.mute.every(4) // mute the stream every 4 divisions
     */ 
    mute = new Pattern() // mute stream

    /**
     * A Pattern for determining whether to solo the stream. If true, mutes all other streams
     * @example
     * s0.solo.set(1) // solo the stream every division
     * s0.solo.every(4) // solo the stream every 4 divisions
     */ 
    solo = new Pattern() // solo stream

    /**
     * An object used to map parameter names to different keys. Useful for mapping to MIDI controllers
     * @example
     * s0.map = {amp: 'cc1', cutoff: 'cc74'}
     */ 
    map = {}

    /** @hidden */
    constructor(id: string) {
        this.id = id;

        // catch all calls to this.p, this.px, this.py, this.pz and return a new Pattern if the key doesn't exist
        const handler = {
            get: (target: Dictionary, key: string) => key in target 
                ? target[key as keyof typeof target] 
                : (target[key] = new Pattern())
        }

        this.p = new Proxy({}, handler)
        this.px = new Proxy({}, handler)
        this.py = new Proxy({}, handler)
        this.pz = new Proxy({}, handler)
    }

    /**
     * @param group a group of patterns, e.g. this.p, this.px
     * @param count t, x, y, z, e.g. the position in time or space
     * @param divisions q or s, e.g. the number of divisions in a cycle or the canvas
     * @param bpm
     * @returns object of formatted key/value pairs
     * @hidden
     */
    evaluateGroup(group: Dictionary, count: number, divisions: number, bpm: number) : { [key: string]: any } {
        return Object.entries(group)
            .map(([key, pattern]) => [key, pattern.get(count, divisions, bpm)])
            .filter(([_, value]) => value !== undefined && value !== null)
            .reduce((obj, [key, value]) => ({...obj, [key]: value}), {})
    }

    // set multiple parameters at once, e.g. s0.set({foo: 1, bar: 2})
    /**
     * Set multiple stream parameter using key/value pairs
     * @param ps key/value pairs
     * @example
     * s0.set({amp: 1, n: 60, reverb: 0.5})
     */ 
    set(ps: Dictionary) {
        Object.entries(ps).forEach(([key, value]) => {
            this.p[key].set(value)
        })
    }
    /** @hidden */
    getE(time: number = 0, q: number = 16) {
        // use stream t, if set, or global t
        this._t = +(this.t.has() ? this.t.get(time, q) || 0 : time);
        this._mute = !!this.mute.get(this._t, q)
        this._solo = !!this.solo.get(this._t, q)
        this._e = !!this.e.get(this._t, q) && !this._mute
    }

    /** @hidden */
    getM(q: number = 16) {
        const t = this._t
        this._m = !!this.m.get(t, q) && !this._mute
    }

    /** @hidden */
    get(q: number = 16, s: number = 16, bpm: number = 120, global: Zen) {
        // use stream t, if set, or global t
        const t = this._t
        
        // use stream x, y, z, if set, or 0
        const xyz = [this.xyz.get(t, s)].flat()
        const x = +(xyz[0] || this.x.get(t, s) || 0)
        const y = +(xyz[1] || this.y.get(t, s) || 0)
        const z = +(xyz[2] || this.z.get(t, s) || 0)
        
        const { id } = this;
        const mute = this._mute
        const solo = this._solo
        const e = this._e
        const m = this._m
        const lag = (60000/bpm)/q // ms per division

        // compile all parameters
        const compiled = (e || m) ? {
            ...this.evaluateGroup(global.p, t, q, bpm), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(global.px, x, s, bpm), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(global.py, y, s, bpm), // ...
            ...this.evaluateGroup(global.pz, z, s, bpm), // ...
            ...this.evaluateGroup(this.p, t, q, bpm), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(this.px, x, s, bpm), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(this.py, y, s, bpm), // ...
            ...this.evaluateGroup(this.pz, z, s, bpm), // ...
            bpm, // bpm
            q, // divisions
        } : {}

        return { 
            id, 
            e, m, 
            mute, solo,
            x: mod(x,s), y: mod(y,s), z: mod(z,s), 
            eparams: formatEventParams(compiled, this.map), 
            mparams: formatMutationParams(compiled, this.map, lag) 
        }
    }

    /** @hidden */
    reset() {
        const { t, x, y, z, xyz, e, m, solo, mute } = this;
        [t, x, y, z, xyz, e, m, solo, mute].forEach(p => p.reset())
        this._t = 0
        this._mute = false
        this._solo = false
        this._e = false
        this._m = false

        Object.values(this.p).forEach(p => p.reset())
        Object.values(this.px).forEach(p => p.reset())
        Object.values(this.py).forEach(p => p.reset())
        Object.values(this.pz).forEach(p => p.reset())
    }
}