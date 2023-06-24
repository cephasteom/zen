import Parameter from './Parameter'
import { Transport, immediate } from 'tone'

// TODO: should the loop be outside of the zen class?

class Zen {
    // incrementing time
    private _t: number = 0

    // size of canvas, can be updated but not patterned
    private _s: number = 16

    // frames per cycle, can be updated but not patterned
    private _q: number = 16

    bpm = new Parameter(120)

    get t() {
        return this._t
    }

    set t(value: number) {
        this._t = value
    }

    get s() {
        return this._s
    }

    set s(value: number) {
        this._s = value
    }

    get q() {
        return this._q
    }

    set q(value: number) {
        this._q = value
    }

    // cycle
    get c() {
        return Math.floor(this._t / this._q)
    }
}

export default Zen;