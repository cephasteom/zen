import type { Dictionary } from './types'
import { output, fxChannels } from './routing';

export const handleFxEvent = (time: number, id: string, params: Dictionary) => {
    if(!['fx0', 'fx1', 'fx2', 'fx3'].includes(id)) return
    
    const { track } = params;
    const channel = (track || +id.replace('fx', '') || 0) * 2

    fxChannels[id].routeOut(channel % output.numberOfInputs)

    // set fx params on that channel
    fxChannels[id].set(params, time)
}

export const handleFxMutation = (time: number, id: string, params: Dictionary) => {
    if(!['fx0', 'fx1', 'fx2', 'fx3'].includes(id)) return
    
    const { track, lag=500 } = params;
    const channel = (track || +id.replace('fx', '') || 0) * 2

    fxChannels[id].routeOut(channel % output.numberOfInputs)

    console.log(params, time, lag)
    // mutate fx params on that channel
    fxChannels[id].mutate(params, time, lag)
}