import { Merge, getDestination, Limiter } from 'tone'
import Channel from './classes/Channel'
import type { Dictionary } from './types'

// Limiter
const limiter = new Limiter({threshold: -20})

// Output
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)

export const output = new Merge({channels: destination.maxChannelCount})
output.connect(destination)

// FX channel strips, connected by a bus from all channels
export const fxChannels: Dictionary = {
    0: new Channel(output, 0 % output.numberOfInputs),
    2: new Channel(output, 2 % output.numberOfInputs),
    4: new Channel(output, 4 % output.numberOfInputs),
    6: new Channel(output, 6 % output.numberOfInputs),
}

// instrument channels strips, placed at the head of each stream
const channels: Dictionary = {}

export const getChannel = (channel: number) => {
    if(!channels[channel]) {
        channels[channel] = new Channel(output, channel % output.numberOfInputs);

        // connect all buses to the input of the fx channels
        [0,1,2,3].forEach((i: number) => {
            channels[channel].routeBus(i, fxChannels[i*2].input)
        })
        
    }
    return channels[channel]
}

