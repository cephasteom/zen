import { CtSynth, CtSampler, CtGranulator, CtAdditive, CtAcidSynth, CtDroneSynth, CtSubSynth } from "./ct-synths"
import type { dictionary } from './types'
import Channel from './classes/Channel'
import { output } from './destination';

const channels: dictionary = {}
const channelCount = output.numberOfInputs

const synths: dictionary = {}

const synthTypes = ['synth', 'sampler', 'granular', 'additive', 'acid', 'drone', 'sub']
const makeSynth = (type: string) => {
    switch(type) {
        case 'synth': return new CtSynth({lite: true})
        case 'sampler': return new CtSampler()
        case 'granular': return new CtGranulator()
        case 'additive': return new CtAdditive()
        case 'acid': return new CtAcidSynth()
        case 'drone': return new CtDroneSynth()
        case 'sub': return new CtSubSynth()
        default: return null
    }
}
const connect = (synth: any, channel: number, type: string) => {
    if(!synth) return
    !channels[channel] && (channels[channel] = new Channel(output, channel%channelCount))
    synth.connect(channels[channel].input)
    synths[channel] = synths[channel] || {}
    synths[channel][type] = synth
    return synth
}

export const handleSynthEvent = (time: number, id: string, params: any) => {
    const { cut, n = 60, strum = 0, inst, channel } = params;

    // Handle cut notes
    const toCut = cut !== undefined ? [+cut].flat() : []
    toCut.forEach((channel: number) => {
        const stream = synths[channel] || {}
        Object.values(stream).forEach((synth: any) => synth?.cut(time))
    });

    // TODO: handle multiple insts
    [inst].flat().forEach((inst: string, instIndex: number) => {
        // ignore instruments that don't exist
        if(!synthTypes.includes(inst)) return
    
        // Get or make synth
        const synth = synths[params.channel] && synths[params.channel][inst] 
            ? synths[params.channel][inst] 
            : connect(makeSynth(inst), params.channel, inst);

        // handle multiple notes
        [n].flat().forEach((n: number, noteIndex: number) => {
            const ps = Object.entries(params).reduce((obj, [key, val]) => ({
                ...obj,
                [key]: Array.isArray(val) ? val[instIndex%val.length] : val
            }), {});
            ps.n = n

            synth.play(ps, time + (noteIndex * strum));
        })
    })

    // TODO: handle FX
    channels[params.channel].set(params, time)
}
