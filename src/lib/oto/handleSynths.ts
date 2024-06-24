import { writable, get } from "svelte/store";
import { CtSynth, CtSampler, CtGranulator, CtAdditive, CtAcidSynth, CtDroneSynth, CtSubSynth, CtSuperFM, CtWavetable } from "./ct-synths"
import type { Dictionary } from './types'
import { getChannel } from './routing';
import { samples } from './stores'

const otoChannel = new BroadcastChannel('oto')

const synths = writable<Dictionary>({});

const synthTypes = ['synth', 'sampler', 'granular', 'additive', 'acid', 'drone', 'sub', 'superfm', 'wavetable']
const makeSynth = (type: string) => {
    switch(type) {
        case 'synth': return new CtSynth({lite: true})
        case 'sampler': return new CtSampler()
        case 'granular': return new CtGranulator()
        case 'additive': return new CtAdditive()
        case 'acid': return new CtAcidSynth()
        case 'drone': return new CtDroneSynth()
        case 'sub': return new CtSubSynth()
        case 'superfm': return new CtSuperFM()
        case 'wavetable': return new CtWavetable()
        default: return null
    }
}

const connect = (synth: any, channel: number, type: string) => {
    if(!synth) return

    const ch = getChannel(channel)

    // connect synth to channel
    synth.connect(ch.input)

    // add synth to store
    synths.update((obj: Dictionary) => ({
        ...obj,
        [channel]: {
            ...obj[channel],
            [type]: synth
        }
    }))
    return synth
}

export const handleSynthEvent = (time: number, params: Dictionary) => {
    const { cut, n = 60, strum = 0, inst, cutr = 5, track } = params;
    const channel = track * 2

    // Handle cut notes
    const toCut = cut !== undefined ? [cut].flat() : []
    toCut.forEach((i: number) => {
        const channel = +i * 2
        const stream = get(synths)[channel] || {}
        Object.values(stream).forEach((synth: any) => synth?.cut(time, cutr))
    });

    // handle multiple insts
    [inst].flat().forEach((inst: string | number, instIndex: number) => {
        inst = typeof(inst) === 'number' ? synthTypes[inst] : inst;
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
            synth.play(ps, time + (noteIndex * (strum/1000)));
        })
    })

    // set fx params on that channel
    const ch = getChannel(channel)
    ch.set(params, time);

    // handle buses
    [params.fx0, params.fx1, params.fx2, params.fx3]
        .forEach((gain: number = 0, i: number) => {
            gain !== undefined && ch.send(i, gain, time)
        })
}

export const handleSynthMutation = (time: number, params: Dictionary) => {
    const { lag=500, track } = params;
    const channel = track * 2

    const { n } = params
    const ps = n !== undefined
        ?  {...params, n: Array.isArray(n) ? n[0] : n}
        : params

    const store = get(synths)
    Object.values(store[channel] || {}).forEach((s: any) => s.mutate(ps, time, lag))
    
    // mutate fx params on that channel
    const ch = getChannel(channel)
    ch.mutate(ps, time, lag);

    // handle buses
    [params.fx0, params.fx1, params.fx2, params.fx3]
        .forEach((gain: number = 0, i: number) => {
            gain !== undefined && ch.send(i, gain, time, lag)
        })
}

// Fetch samples lists
// const samples = writable<Dictionary>({});

const fetchSamples = (url: string) => {
    fetch(url)
        .then(res => res.json())
        .then(json => {
            if(!json) return
            otoChannel.postMessage({ type: 'success', message: 'Loaded samples from ' + url})
            samples.update((samples: Dictionary) => ({...samples, ...json}))
        })
        .catch(_ => console.log('No samples available at ' + url))
}

fetchSamples('/samples/samples.json')
fetchSamples('http://localhost:5000/samples.json')

synths.subscribe((synths: Dictionary) => {
    Object.values(synths).forEach(({sampler, granular, wavetable}) => 
        [sampler, granular, wavetable].forEach(synth => 
            synth && (synth.banks = {...synth.banks, ...get(samples)})
        ))
})

samples.subscribe((samples: Dictionary) => {
    otoChannel.postMessage({ type: 'info', message: 'Sample banks ->\n' + Object.keys(samples).join(', ') + '\n'})
})