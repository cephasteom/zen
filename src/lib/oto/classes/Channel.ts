import type { Dictionary } from "../types";
import { Split, Gain, context } from 'tone'
import { CtFXChannel, CtFXReverb, CtFXDelay } from "../ct-synths"
class Channel {
    input
    _fx: any
    _reverb: any
    _delay: any
    _output
    _activity = 0
    constructor(destination: any, channel: number) {
        this.input = new Gain(1)
        this._output = new Split({context, channels: 2})
        
        this.input.connect(this._output)
        
        this._output.connect(destination, 0, channel)
        this._output.connect(destination, 1, channel+1)
    }

    set(params: Dictionary, time: number) {
        if(!this._fx && this._activity > 2) {
            const { dist = 0, ring = 0, chorus = 0, hicut = 0, locut = 0 } = params;
            [dist, ring, chorus, hicut, locut].reduce((a, b) => a + b, 0) > 0 
                && this.initFX()
        }
        // Stagger the initialization of reverb and delay
        if(this._activity > 3) {
            params.reverb > 0 && !this._reverb && this.initReverb()
            params.delay > 0 && !this._delay && this.initDelay()
        }
        this._fx && this._fx.set(params, time)
        this._reverb && this._reverb.set(params, time)
        this._delay && this._delay.set(params, time)
        this._activity <= 3 && this._activity++
    }

    mutate(params: Dictionary, time: number, lag: number) {
        this._fx?.mutate(params, time, lag)
    }

    initFX() {
        this._fx = new CtFXChannel()
        this.handleRouting()
    }

    initDelay() {
        this._delay = new CtFXDelay()
        this.handleRouting()
    }

    initReverb() {
        this._reverb = new CtFXReverb()
        this.handleRouting()
    }

    handleRouting() {
        const { _fx, _reverb, _delay, input, _output } = this
        const fx = [_fx, _delay, _reverb]
        
        // disconnect chain
        fx.forEach(fx => fx && fx.disconnect())
        input.disconnect()

        const first = fx.find(Boolean)
        const last = [...fx].reverse().find(Boolean)
        
        input.connect(first?.input || _output)
        last?.connect(_output)

        fx.filter(Boolean).reduce((prev, curr) => {
            prev && curr && prev.connect(curr.input)
            return curr
        }, null)

    }
}

export default Channel