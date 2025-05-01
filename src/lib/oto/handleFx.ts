import type { Dictionary } from './types'
import { output, fxChannels } from './routing';

export const handleFxEvent = (time: number, id: string, params: Dictionary) => {
    if(!['fx0', 'fx1', 'fx2', 'fx3'].includes(id)) return
    
    const { out = 0 } = params;

    fxChannels[id].routeOut(out)

    // set fx params on that channel
    fxChannels[id].set(params, time)
}

export const handleFxMutation = (time: number, id: string, params: Dictionary) => {
    if(!['fx0', 'fx1', 'fx2', 'fx3'].includes(id)) return
    const { lag=500, out = 0 } = params;

    fxChannels[id].routeOut(out)

    // mutate fx params on that channel
    fxChannels[id].mutate(params, time, lag)
}