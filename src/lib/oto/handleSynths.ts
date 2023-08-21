import { writable, get } from "svelte/store";
import { CtSynth, CtSampler, CtGranulator, CtAdditive, CtAcidSynth, CtDroneSynth, CtSubSynth } from "./ct-synths"
import type { Dictionary } from './types'
import Channel from './classes/Channel'
import { output } from './destination';

const instMap = [ 'synth', 'sampler', 'granular', 'additive', 'acid', 'drone', 'sub' ]

const channels: Dictionary = {}
const channelCount = output.numberOfInputs

// const synths: Dictionary = {}
const synths = writable<Dictionary>({});

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
    synths.update((obj: Dictionary) => ({
        ...obj,
        [channel]: {
            ...obj[channel],
            [type]: synth
        }
    }))
    return synth
}

export const handleSynthEvent = (time: number, id: string, params: Dictionary) => {
    const { cut, n = 60, strum = 0, inst, cutr = 5 } = params;
    const channel = +id.slice(1) * 2

    // Handle cut notes
    const toCut = cut !== undefined ? [cut].flat() : []
    toCut.forEach((i: number) => {
        const channel = +i * 2
        const stream = get(synths)[channel] || {}
        Object.values(stream).forEach((synth: any) => synth?.cut(time, cutr))
    });

    // handle multiple insts
    [inst].flat().forEach((inst: string | number, instIndex: number) => {
        inst = typeof(inst) === 'number' ? instMap[inst] : inst;
        // ignore instruments that don't exist
        if(!synthTypes.includes(inst)) return
    
        // Get or make synth
        const store = get(synths)
        const synth = store[channel] && store[channel][inst] 
            ? store[channel][inst] 
            : connect(makeSynth(inst), channel, inst);

        // handle multiple notes
        [n].flat().forEach((n: number, noteIndex: number) => {
            const ps: Dictionary = Object.entries(params).reduce((obj, [key, val]) => ({
                ...obj,
                [key]: Array.isArray(val) ? val[instIndex%val.length] : val
            }), {});
            ps.n = n

            synth.play(ps, time + (noteIndex * strum));
        })
    })

    // handle FX
    channels[channel]?.set(params, time)
}

export const handleSynthMutation = (time: number, id: string, params: Dictionary) => {
    const { lag=500 } = params;
    const channel = +id.slice(1) * 2

    const { n } = params
    const ps = n !== undefined
        ?  {...params, n: Array.isArray(n) ? n[0] : n}
        : params

    const store = get(synths)
    Object.values(store[channel] || {}).forEach((s: any) => s.mutate(ps, time, lag))
    
    channels[channel]?.mutate(ps, time, lag)
}

// Fetch samples lists
const samples = writable<Dictionary>({});
// fetch samples
['/samples/samples.json/', 'http://localhost:5000/samples.json'].forEach(url => {
    fetch(url)
        .then(res => res.json())
        .then(json => {
            if(!json) return
            console.log('Loaded samples from ' + url)
            samples.update((samples: Dictionary) => ({...samples, ...json}))
            
        })
        .catch(_ => console.log('No samples available at ' + url))
})

synths.subscribe((synths: Dictionary) => {
    Object.values(synths).forEach(({sampler, granular}) => 
        [sampler, granular].forEach(synth => 
            synth && (synth.banks = {...synth.banks, ...get(samples)})
        ))
})

samples.subscribe((samples: Dictionary) => console.log(...Object.keys(samples)))