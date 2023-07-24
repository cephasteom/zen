import { Stream } from './Stream';
import { Pattern } from './Pattern'
import { clamp } from '../utils/utils'

export class Zen extends Stream {
    /** @hidden */
    constructor() {
        super('z')
    }

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

    // when to update the executed code, ie at the next division, on the next beat, etc
    /** @hidden */
    private _update: number = 1

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
     * @example
     * s0.e.every(c%2 ? 1 : 4) // every 1 frame on odd cycles, every 4 frames on even cycles
     */ 
    get c() {
        return Math.floor(this._t / this._q)
    }

    /**
     * @hidden
     */ 
    get update() {
        return this._update
    }

    /**
     * Set when to update the executed code
     * @example
     * z.update = 1 // update on every frame
     * z.update = 4 // update on every 4th frame
     * z.update = q // update on the next cycle
     */
    set update(value: number) {
        this._update = clamp(Math.floor(value), 1, this._q * 16)
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
    resetGlobals(t: number) {
        this._t = t;
        this._s = 16;
        this._q = 16;
        this._update = 1;
        [this.bpm, this.t].forEach(p => p.reset())
    }
}