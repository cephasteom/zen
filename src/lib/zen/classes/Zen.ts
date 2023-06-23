import Parameter from './Parameter'
import { Loop, Transport, immediate } from 'tone'
import { createCount } from '../utils/utils'

class Zen {
    // callbacks to be called on every time update
    private _tCallbacks: Function[] = []

    // global time, absolute time, cannot be changed
    private _time: number = 0

    // size of canvas, can be updated but not patterned
    private _size: number = 16

    // frames per cycle, can be updated but not patterned
    private _quant: number = 16

    // loop
    private _loop: Loop

    bpm = new Parameter(120)

    constructor() {
        this.setLoop()
    }

    get time() {
        return this._time
    }

    get size() {
        return this._size
    }

    set size(value: number) {
        this._size = value
    }

    get quant() {
        return this._quant
    }

    set quant(value: number) {
        this._quant = value
    }

    get cycle() {
        return Math.floor(this._time / this._quant)
    }

    addTCallback(callback: Function) {
        this._tCallbacks = [...this._tCallbacks, callback]
    }

    setLoop() {
        this._loop = new Loop(time => {
            // increment t
            const t = this._time++
            
            // call t callbacks
            const delta = (time - immediate()) * 1000
            setTimeout(() => this._tCallbacks.forEach(callback => callback(t)), delta);

        }, `${this._quant}n`).start(0)
    }

    start() {
        Transport.start('+0.1')
    }

    stop() {
        Transport.stop()
    }

    pause() {
        Transport.pause()
    }
}

export default Zen;