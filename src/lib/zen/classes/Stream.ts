// TODO: improve typing
import Pattern from './Pattern'
import { mod } from '../utils/utils'
import { formatEventParams, formatMutationParams } from '../utils/syntax';

class Stream {
    id: string
    #t = 0
    #q = 0
    #s = 0
    #bpm = 120
    
    // parameter groups
    p = {}
    px = {}
    py = {}
    pz = {}
    
    // patternable parameters
    t = new Pattern() // used to overide the global t
    x = new Pattern()
    y = new Pattern()
    z = new Pattern()

    // should stream trigger event or mutation
    // uses normal Parameter class but values will be interpreted as booleans
    e = new Pattern()
    m = new Pattern()

    constructor(id: string) {
        this.id = id;
        /* 
         * set 'p', 'px'... as functions accepting any parameter name
         * store Patterns by group in this.ps
         * work with a single or array of parameters(s)
        */
        ['p', 'px', 'py', 'pz'].forEach(group => {
            this[group] = (key: string | []) => (
                Array.isArray(key) 
                    ? key.map(key => this.getParameter(key, this[group]))
                    : this.getParameter(key, this[group])
            )
        })
    }

    getParameter(key: string, group: {}) {
        !group[key] && (group[key] = new Pattern())
        return group[key]
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
            this.p(key).set(value)
        })
    }

    get(time: number = 0, q: number = 16, s: number = 16, bpm: number = 120) {
        // use stream t, if set, or global t
        const t = this.t.has() ? Math.round(this.t.get(time, q) || 0) : time
        
        // use stream x, y, z, if set, or 0
        const x = this.x.get(t, s) || 0
        const y = this.y.get(t, s) || 0
        const z = this.z.get(t, s) || 0
        
        const { id } = this
        const e = this.e.get(t, q)
        const m = this.m.get(t, q)
        
        const params = e || m ? {
            ...this.evaluateGroup(this.p, t, q, bpm), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(this.px, x, s, bpm), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(this.py, y, s, bpm), // ...
            ...this.evaluateGroup(this.pz, z, s, bpm), // ...
        } : {}
        
        return { id, e, m, x: mod(x,s), y: mod(y,s), z: mod(z,s), eparams: formatEventParams(params), mparams: formatMutationParams(params) }
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