import { Stream } from './Stream';
import { Pattern } from './Pattern'
import { clamp } from '../utils/utils'

/**
 * The Zen class allows you to set global parameters. It is available within Zen as `z`.
 * @example
 * z.t.range(0, 16, 1) // pattern time
 * z.bpm.range(60, 120, 1) // pattern bpm
 * z.s = 16 // size of canvas
 * z.q = 16 // frames per cycle
 * z.update = 1 // when to update the executed code, 1 is on the next division, q is on the next cycle etc.
 * z.set({reverb: 1, rsize: 0.5}) // set global parameters for all streams. Can be overwritten by stream parameters
 * z.p.n.scales('d-dorian', 16) // set global time parameters using z.p
 * z.px._modi.range(0, 1, 0.25) // set global stream parameters using z.px
 * etc.
 */ 
export class Zen extends Stream {
    /** @hidden */
    constructor() {
        super('z')
    }

    /** @hidden */
    _tPattern: null | Pattern = null
    /**
     * A Pattern for setting the global time. The outcome of the pattern updates the variable `t` within your code.
     * @example
     * z.t.sine(0,16,1) // set the global t with a sine wave between 0 and 16
     */ 
    get t() { 
        this._tPattern = this._tPattern || new Pattern()
        return this._tPattern
    }

    /** @hidden */
    _bpmPattern: null | Pattern = null
    /**
     * A Pattern for setting the global bpm
     * @example
     * z.bpm.saw(60,120,0.5) // set the global bpm with a saw wave between 60 and 120, over 2 cycles
     */ 
    get bpm() {
        this._bpmPattern = this._bpmPattern || new Pattern()
        return this._bpmPattern
    }

    /** @hidden */
    _swingPattern: null | Pattern = null
    /**
     * A Pattern for setting the global swing. A value between 0 and 1
     * @example
     * z.swing.set(0.1)
     */ 
    get swing() {
        this._swingPattern = this._swingPattern || new Pattern()
        return this._swingPattern
    } 
    
    /** @hidden */
    _swingnPattern: null | Pattern = null
    /**
     * A Pattern for setting the global swing subdivision, e.g. 8 for 1/8th notes, 16 for 1/16ths
     * @example
     * z.swingn.set(8)
     */ 
    get swingn() {
        this._swingnPattern = this._swingnPattern || new Pattern()
        return this._swingnPattern
    } 

    /** @hidden */
    _seedPattern: null | Pattern = null
    /**
     * A Pattern for setting the global seeding
     * @example
     * z.seed.saw(0,1,0.5) // set the global seed with a saw wave between 0 and 1, over 2 cycles
     */
    get seed() {
        this._seedPattern = this._seedPattern || new Pattern()
        return this._seedPattern
    }

    /** @hidden */
    _latencyPattern: null | Pattern = null
    /**
     * A Pattern for setting the global latency
     * @example
     * z.latency.set(500) // set the global latency to 500ms
     */
    get latency() {
        this._latencyPattern = this._latencyPattern || new Pattern()
        return this._latencyPattern
    }

    /** @hidden */
    _gridPattern: null | Pattern = null
    /**
     * A Pattern for displaying data on the grid. Expects an array of numbers between 0 and 1
     * @example
     * z.grid.set(Array.from({length: 16*16}, () => Math.random())) // random values between 0 and 1
     */
    get grid() {
        this._gridPattern = this._gridPattern || new Pattern()
        return this._gridPattern
    }   
    
    /** @hidden */
    _clockPattern: null | Pattern = null
    /**
     * A Pattern for setting the clock source. Either 'internal' or a MIDI device index
     * It's a pattern, but you should only use the set method
     * @example
     * z.clock.set({src: 'internal'}) // set the clock source to internal
     * z.clock.set({src: 'midi', device: 0}) // set the clock source to MIDI device 0
     */
    get clock() {
        this._clockPattern = this._clockPattern || new Pattern()
        return this._clockPattern
    }   

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
    getTime(t: number) : number {
        const localT = this.t.get(t, this._q)
        const globalT = t
        this._t = localT !== null ? Array.isArray(localT) ? localT[0] : localT : globalT
        return Math.floor(this._t)
    }

    /** @hidden */
    getBpm() : number {
        const value = this.bpm.get(this._t, this._q)
        return value !== null ? Array.isArray(value) ? value[0] : value : 120
    }

    /** @hidden */
    getClock() : any {
        return this.clock.get(this._t, this._q) || {}
    }

    getSwing() : number {
        const value = this.swing.get(this._t, this._q)
        return value !== null ? Array.isArray(value) ? value[0] : value : 0
    }

    getSwingN() : number {
        const value = this.swingn.get(this._t, this._q)
        return value !== null ? Array.isArray(value) ? value[0] : value : 16
    }

    /** @hidden */
    getSeed(): any {
        return this.seed.get(this._t, this._q)
    }

    /** @hidden */
    getLatency(): any {
        return this.latency.get(this._t, this._q)
    }

    /** @hidden */
    resetGlobals() {
        [this._bpmPattern, this._tPattern, this._seedPattern, this._gridPattern].forEach(p => p?.reset())
    }
}