import Pattern from './Pattern'
import { clamp } from '../utils/utils'

class Zen {
    // be able to pattern time e.g. z.t.range(0, 16, 1)
    t = new Pattern()

    // be able to pattern bpm e.g. z.bpm.range(60, 120, 1)
    bpm = new Pattern()

    // global time
    private _t: number = 0

    // size of canvas, can be updated but not patterned
    private _s: number = 16

    // frames per cycle, can be updated but not patterned
    private _q: number = 16

    // be able to store state. TODO: this needs some thinking about.
    // need to initialize it then update it
    state: any = {}

    get s() {
        return this._s
    }

    set s(value: number) {
        this._s = clamp(Math.floor(value), 1, 48)
    }

    get q() {
        return this._q
    }

    set q(value: number) {
        this._q = clamp(Math.floor(value), 1, 64)
    }

    // cycle
    get c() {
        return Math.floor(this._t / this._q)
    }

    getTime() : number {
        const localT = this.t.get(this._t, this._q)
        const globalT = this._t
        this._t = localT !== null ? Array.isArray(localT) ? localT[0] : localT : globalT
        return this._t
    }

    getBpm() : number {
        const value = this.bpm.get(this._t, this._q)
        return value !== null ? Array.isArray(value) ? value[0] : value : 120
    }

    reset(t: number) {
        this._t = t;
        [this.bpm, this.t].forEach(p => p.reset())
    }
}

export default Zen;