// All handling of separate fx streams
import type { Dictionary } from './types'
import { output } from './destination';
import Channel from './classes/Channel'

// create a Dict of channels
const channelCount = output.numberOfInputs
const channels: Dictionary = {
    0: new Channel(output, 0%channelCount),
    2: new Channel(output, 2%channelCount),
    4: new Channel(output, 4%channelCount),
    6: new Channel(output, 6%channelCount),
}

export const handleFxEvent = (time: number, id: string, params: Dictionary) => {
    const { track } = params;
    const channel = track * 2

    // if asking to connect to a channel that doesn't exist, create it
    !channels[channel] && (channels[channel] = new Channel(output, channel%channelCount))

    // set fx params on that channel
    channels[channel]?.set(params, time)
}

export const handleFxMutation = (time: number, id: string, params: Dictionary) => {
    const { track } = params;
    const channel = track * 2

    // mutate fx params on that channel
    channels[channel]?.mutate(params, time)
}