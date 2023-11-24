// TODO: handle routing, connect and disconnect
// All handling of separate fx streams
import type { Dictionary } from './types'
import { output } from './destination';
import Channel from './classes/Channel'
import { buses } from './buses'

// create a Dict of channels
const channelCount = output.numberOfInputs
const channels: Dictionary = {
    0: new Channel(output, 0%channelCount),
    2: new Channel(output, 2%channelCount),
    4: new Channel(output, 4%channelCount),
    6: new Channel(output, 6%channelCount),
}

// connect buses to channels
Object.values(channels).forEach((channel, i) => buses[i].connect(channel.input))

export const handleFxEvent = (time: number, id: string, params: Dictionary) => {
    if(!['fx0', 'fx1', 'fx2', 'fx3'].includes(id)) return
    console.log('handleFxEvent', id, params)
    
    const { track } = params;
    const channel = track || +id.replace('fx', '') || 0

    // set fx params on that channel
    channels[channel]?.set(params, time)
}

export const handleFxMutation = (time: number, id: string, params: Dictionary) => {
    const { track } = params;
    const channel = track * 2

    // mutate fx params on that channel
    channels[channel]?.mutate(params, time)
}