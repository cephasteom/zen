import type { Dictionary } from "../types";
import { Split, context } from 'tone'
import { CtFXChannel, CtFXReverb, CtFXDelay } from "../ct-synths"
class Channel {
    _fx
    _reverb
    _delay
    input
    _output
    _activity = 0
    constructor(destination: any, channel: number) {
        this._output = new Split({context, channels: 2})
        this._output.connect(destination, 0, channel)
        this._output.connect(destination, 1, channel+1)
        
        this._fx = new CtFXChannel()
        
        // routing
        this.input = this._fx.input
        this._fx.connect(this._output)
    }

    set(params: Dictionary, time: number) {
        // Stagger the initialization of reverb and delay
        if(this._activity > 3) {
            params.reverb > 0 && !this._reverb && this.initReverb()
            params.delay > 0 && !this._delay && this.initDelay()
        }
        this._fx.set(params, time)
        this._reverb && this._reverb.set(params, time)
        this._delay && this._delay.set(params, time)
        this._activity <= 3 && this._activity++
    }

    mutate(params: Dictionary, time: number, lag: number) {
        this._fx.mutate(params, time, lag)
    }

    initDelay() {
        this._delay = new CtFXDelay()
        this._fx.connect(this._delay.input)
        this._reverb
            ? this._delay.connect(this._reverb.input)
            : this._delay.connect(this._output)
    }

    initReverb() {
        this._reverb = new CtFXReverb()
        this._reverb.connect(this._output)
        this._delay 
            ? this._delay.connect(this._reverb.input)
            : this._fx.connect(this._reverb.input)
    }
}

export default Channel