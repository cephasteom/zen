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

// instrument channels strips, placed at the head of each stream
const channels: Dictionary = {
    0: new Channel(output, 0 % output.numberOfInputs),
    2: new Channel(output, 2 % output.numberOfInputs),
    4: new Channel(output, 4 % output.numberOfInputs),
    6: new Channel(output, 6 % output.numberOfInputs),
    8: new Channel(output, 8 % output.numberOfInputs),
    10: new Channel(output, 10 % output.numberOfInputs),
    12: new Channel(output, 12 % output.numberOfInputs),
    14: new Channel(output, 14 % output.numberOfInputs),
}

export const getChannel = (channel: number) => {
    !channels[channel] && (channels[channel] = new Channel(output, channel % output.numberOfInputs))
    return channels[channel]
}

// FX Channels

