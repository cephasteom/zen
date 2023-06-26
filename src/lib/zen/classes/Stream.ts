// TODO: improve typing
import Parameter from './Parameter'

class Stream {
    id: string
    // parameter groups
    p = {}
    px = {}
    py = {}
    pz = {}
    
    // patternable parameters
    t = new Parameter() // used to overide the global t
    x = new Parameter()
    y = new Parameter()
    z = new Parameter()

    // should stream trigger event or mutation
    // uses normal Parameter class but values will be interpreted as booleans
    e = new Parameter()
    m = new Parameter()

    constructor(id: string) {
        this.id = id;
        /* 
         * set 'p', 'px'... as functions accepting any parameter name
         * store Parameters by group in this.ps
         * work with a single or array of parameter(s)
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
        !group[key] && (group[key] = new Parameter())
        return group[key]
    }

    // @ts-ignore
    evaluateGroup(group, position) {
        // @ts-ignore
        return Object.entries(group).reduce((obj, [key, parameter]) => ({
            ...obj,
            // @ts-ignore
            [key]: parameter.get(position)
        }), {})
    }

    // set multiple parameters at once, e.g. s0.set({foo: 1, bar: 2})
    set(ps: {}) {
        Object.entries(ps).forEach(([key, value]) => {
            this.p(key).set(value)
        })
    }

    get(time: number = 0, q: number = 16, s: number = 16) {
        // use stream t, if set, or global t
        const t = this.t.has() ? this.t.get(time/q) : time

        // use stream x, y, z, if set, or 0
        const x = this.x.has() ? this.x.get(t/s) : 0
        const y = this.y.has() ? this.y.get(t/s) : 0
        const z = this.z.has() ? this.z.get(t/s) : 0
        
        const { id } = this
        const e = this.e.get(t/q)
        const m = this.m.get(t/q)

        // id === 's0' && console.log(x, y, z)
        
        const params = e || m ? {
            ...this.evaluateGroup(this.p, t/q), // calculate based on position in cycle, 0 - 1
            ...this.evaluateGroup(this.px, x/s), // calculate based on position in space, 0 - 1
            ...this.evaluateGroup(this.py, y/s), // ...
            ...this.evaluateGroup(this.pz, z/s), // ...
        } : {}
        
        return { id, e, m, params }
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