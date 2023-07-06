// TODO: improve typing
import Pattern from './Pattern'
import { mod } from '../utils/utils'
import { formatEventParams, formatMutationParams } from '../utils/syntax';
import type { Dictionary } from '../types'

class Stream {
    id: string
    
    // parameter groups
    p: ProxyHandler<Dictionary>
    px: ProxyHandler<Dictionary>
    py: ProxyHandler<Dictionary>
    pz: ProxyHandler<Dictionary>
    
    // patternable parameters
    t = new Pattern() // used to overide the global t
    x = new Pattern()
    y = new Pattern()
    z = new Pattern()

    // should stream trigger event or mutation
    // uses normal Parameter class but values will be interpreted as booleans
    e = new Pattern()
    m = new Pattern()

    // map of event/mutation names to their parameters
    // use this to overide keys in the event/mutation object. Useful for mapping to MIDI CCs
    map = {}

    constructor(id: string) {
        this.id = id;

        // catch all calls to this.p, this.px, this.py, this.pz and return a new Pattern if the key doesn't exist
        const handler = {
            get: (target: Dictionary, key: string) => {
                Object.keys(target).includes(key) || (target[key] = new Pattern());
                return target[key];
            },
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
     */
    evaluateGroup(group: Pattern, count: number, divisions: number, bpm: number) : { [key: string]: any } {
        return Object.entries(group).reduce((obj, [key, pattern]) => ({
            ...obj,
            [key]: pattern.get(count, divisions, bpm)
        }), {})
    }

    // set multiple parameters at once, e.g. s0.set({foo: 1, bar: 2})
    set(ps: {}) {
        Object.entries(ps).forEach(([key, value]) => {
            this.p[key].set(value)
        })
    }

    get(time: number = 0, q: number = 16, s: number = 16, bpm: number = 120) {
        // use stream t, if set, or global t
        const t = Math.floor(this.t.has() ? this.t.get(time, q) || 0 : time);
        
        // use stream x, y, z, if set, or 0
        const x = this.x.get(t, s) || 0
        const y = this.y.get(t, s) || 0
        const z = this.z.get(t, s) || 0
        
        const { id } = this;
        const e = this.e.get(t, q)
        const m = this.m.get(t, q)
    
        // compile all parameters
        const compiled = e || m ? {
            ...this.evaluateGroup(this.p, t, q, bpm), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(this.px, x, s, bpm), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(this.py, y, s, bpm), // ...
            ...this.evaluateGroup(this.pz, z, s, bpm), // ...
        } : {}
        
        return { 
            id, e, m, x: mod(x,s), y: mod(y,s), z: mod(z,s), 
            eparams: formatEventParams(compiled, this.map), 
            mparams: formatMutationParams(compiled, this.map) 
        }
    }

    reset() {
        const { t, x, y, z, e, m } = this;
        [t, x, y, z, e, m].forEach(p => p.reset())

        Object.values(this.p).forEach(p => p.reset())
        Object.values(this.px).forEach(p => p.reset())
        Object.values(this.py).forEach(p => p.reset())
        Object.values(this.pz).forEach(p => p.reset())
    }
}

export default Stream