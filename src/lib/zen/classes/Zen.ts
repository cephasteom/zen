import { Pattern } from './Pattern'
import { clamp } from '../utils/utils'

/**
 * The Zen class allows you to set global parameters. It is available within your code as `z`.
 * @example
 * z.t.range(0, 16, 1) // pattern time
 * z.bpm.range(60, 120, 1) // pattern bpm
 * z.s = 16 // size of canvas
 * z.q = 16 // frames per cycle
 */ 
export class Zen {
    /** @hidden */
    constructor() {}

    /**
     * A Pattern for setting the global time. The outcome of the pattern updates the variable `t` within your code.
     * @example
     * z.t.sine(0,16,1) // set the global t with a sine wave between 0 and 16
     */ 
    t = new Pattern()

    /**
     * A Pattern for setting the global bpm
     * @example
     * z.bpm.saw(60,120,0.5) // set the global bpm with a saw wave between 60 and 120, over 2 cycles
     */ 
    bpm = new Pattern()

    // global time
    /** @hidden */
    private _t: number = 0

    // size of canvas, can be updated but not patterned
    /** @hidden */
    private _s: number = 16

    // frames per cycle, can be updated but not patterned
    /** @hidden */
    private _q: number = 16

    // be able to store state. TODO: this needs some thinking about.
    // need to initialize it then update it
    /** @hidden */
    state: any = {}

    /** @hidden */
    get s() {
        return this._s
    }

    /**
     * Set the size of the canvas. Changing this value updates the variable `s` within your code.
     * @example
     * z.s = 16 // set the size of the canvas to 16
     */ 
    set s(value: number) {
        this._s = clamp(Math.floor(value), 1, 48)
    }

    /** @hidden */
    get q() {
        return this._q
    }

    /**
     * Set the number of divisions per cycle. Changing this value updates the variable `q` within your code.
     * @example
     * z.q = 16 // set the number of divisions per cycle to 16
     */ 
    set q(value: number) {
        this._q = clamp(Math.floor(value), 1, 64)
    }

    /**
     * Get the current cycle. This is available within your code as `c`.
     */ 
    get c() {
        return Math.floor(this._t / this._q)
    }

    /** @hidden */
    getTime() : number {
        const localT = this.t.get(this._t, this._q)
        const globalT = this._t
        this._t = localT !== null ? Array.isArray(localT) ? localT[0] : localT : globalT
        return Math.floor(this._t)
    }

    /** @hidden */
    getBpm() : number {
        const value = this.bpm.get(this._t, this._q)
        return value !== null ? Array.isArray(value) ? value[0] : value : 120
    }

    /** @hidden */
    reset(t: number) {
        this._t = t;
        [this.bpm, this.t].forEach(p => p.reset())
    }
}