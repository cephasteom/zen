// TODO: improve typing
import Pattern from './Pattern'
import { mod, pipe, beatsToSeconds } from '../utils/utils'

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

        this.formatTimeParameter = this.formatTimeParameter.bind(this)
    }

    getParameter(key: string, group: {}) {
        !group[key] && (group[key] = new Pattern())
        return group[key]
    }

    formatTimeParameter(key: string, value: number | string) {
        return ['dur', 'a', 'd', 'r', 'moda', 'modd', 'modr', 'fila', 'fild', 'filr', 'dtime', 'strum', 'slide'].includes(key) 
            ? beatsToSeconds(+value, this.#bpm) 
            : value
    }

    // format pattern value
    format(key: string, value: number) {
        return (pipe(
            this.formatTimeParameter
        )(key, value))
    }

    /**
     * @param group a group of patterns, e.g. this.p, this.px
     * @param count t, x, y, z, e.g. the position in time or space
     * @param divisions q or s, e.g. the number of divisions in a cycle or the canvas
     * @returns object of formatted key/value pairs
     */
    evaluateGroup(group: Pattern, count: number, divisions: number) : { [key: string]: any } {
        return Object.entries(group).reduce((obj, [key, pattern]) => ({
            ...obj,
            [key]: this.format(key, pattern.get(count/divisions))
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
        this.#t = this.t.has() ? Math.round(this.t.get(time/q) || 0) : time
        this.#q = q
        this.#s = s
        this.#bpm = bpm

        // use stream x, y, z, if set, or 0
        const x = this.x.has() ? this.x.get(this.#t/s) : 0
        const y = this.y.has() ? this.y.get(this.#t/s) : 0
        const z = this.z.has() ? this.z.get(this.#t/s) : 0
        
        const { id } = this
        const e = this.e.get(this.#t/q)
        const m = this.m.get(this.#t/q)
        
        const params = e || m ? {
            ...this.evaluateGroup(this.p, this.#t, q), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(this.px, x, s), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(this.py, y, s), // ...
            ...this.evaluateGroup(this.pz, z, s), // ...
        } : {}
        
        return { id, e, m, x: mod(x,s), y: mod(y,s), z: mod(z,s), params }
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