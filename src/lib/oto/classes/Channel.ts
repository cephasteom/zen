import { Split, context } from 'tone'
import { CtFXChain } from "../ct-synths"

class Channel {
    _fx
    input
    constructor(destination: any, channel: number) {
        const split = new Split({context, channels: 2})
        split.connect(destination, 0, channel)
        split.connect(destination, 1, channel+1)

        this._fx = new CtFXChain()
        this._fx.connect(split)

        this.input = this._fx.input
    }

    set(params: any, time: number) {
        this._fx.set(params, time)
    }

}

export default Channel