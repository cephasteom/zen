import type { Dictionary } from "../types";
import { Split, Gain, context } from 'tone'
import { CtFXChannel, CtFXReverb } from "../ct-synths"

const reverb = new CtFXReverb()
reverb.connect(context.destination)

class Channel {
    _fx
    _reverbBus
    input
    constructor(destination: any, channel: number) {
        this.input = new Gain(1)
        
        this._reverbBus = new Gain(1)
        this.input.connect(this._reverbBus)
        this._reverbBus.connect(reverb.input)
        
        const split = new Split({context, channels: 2})
        split.connect(destination, 0, channel)
        split.connect(destination, 1, channel+1)

        this._fx = new CtFXChannel()
        this._fx.connect(split)
        this.input.connect(this._fx.input)
    }

    set(params: Dictionary, time: number) {
        this._fx.set(params, time)
        this._reverbBus.gain.setValueAtTime(params.reverb, time)
        reverb.set(params, time)
    }

    mutate(params: Dictionary, time: number, lag: number) {
        this._fx.mutate(params, time, lag)
        this._reverbBus.gain.linearRampToValueAtTime(params.reverb, time + lag)
        reverb.mutate(params, time, lag)
    }

}

export default Channel