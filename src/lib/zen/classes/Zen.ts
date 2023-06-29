import Pattern from './Pattern'
import { clamp } from '../utils/utils'

class Zen {
    // incrementing time
    private _t: number = 0

    // size of canvas, can be updated but not patterned
    private _s: number = 16

    // frames per cycle, can be updated but not patterned
    private _q: number = 16

    bpm = new Pattern(120)

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
        this._s = clamp(Math.floor(value), 1, 48)
    }

    get q() {
        return this._q
    }

    set q(value: number) {
        this._s = clamp(Math.floor(value), 1, 64)
    }

    // cycle
    get c() {
        return Math.floor(this._t / this._q)
    }

    reset() {
        [this.bpm].forEach(p => p.reset())
    }
}

export default Zen;