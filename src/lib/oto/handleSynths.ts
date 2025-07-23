import { writable, get } from "svelte/store";
import { CtSynth, CtSampler, CtGranulator, CtAdditive, CtAcidSynth, CtDroneSynth, CtSubSynth, CtSuperFM, CtWavetable } from "./ct-synths"
import ZMod from './ZMod'
import type { Dictionary } from './types'
import { busses, fxChannels, getChannel } from './routing';
import { samples } from './stores'
import { mtf } from "./utils/utils";

const otoChannel = new BroadcastChannel('oto')

const synths = writable<Dictionary>({});

const synthTypes = ['synth', 'sampler', 'granular', 'additive', 'acid', 'drone', 'sub', 'superfm', 'wavetable', 'zmod']
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
        case 'zmod': return new ZMod({busses})
        default: return null
    }
}

const connect = (synth: any, channel: number, out: number, type: string) => {
    if(!synth) return

    // get channel if it exists, or create a new one and connect to given output
    const ch = getChannel(channel, out)

    // connect synth to channel
    synth.connect(ch.input, [channel, channel + 1]) 

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
    const { cut, n = 60, strum = 0, inst, cutr = 10, track, out = 0 } = params;
    // channel strip to use, by default, each stream has its own channel strip
    const channel = track * 2

    // Handle cut notes
    const toCut = cut !== undefined ? [cut].flat() : []
    toCut.forEach((i: number) => {
        const channel = +i * 2
        const stream = get(synths)[channel] || {}
        Object.values(stream).forEach((synth: any) => synth?.cut(time, cutr))
    });

    const store = get(synths);

    // handle multiple insts
    [inst].flat().forEach((inst: string | number, instIndex: number) => {
        inst = typeof(inst) === 'number' ? synthTypes[inst] : inst;
        
        // ignore instruments that don't exist
        if(!synthTypes.includes(inst)) return
        
        // synths are associated with a channel strip
        const synth = store[channel] && store[channel][inst] 
            // if it exists, use it
            ? store[channel][inst]
            // otherwise, make a new one and connect it with the channel strip
            : connect(makeSynth(inst), channel, out, inst);
        
        
        // handle multiple notes
        [n].flat().forEach((n: number, noteIndex: number) => {
            const ps: Dictionary = Object.entries(params).reduce((obj, [key, val]) => ({
                ...obj,
                [key]: Array.isArray(val) ? val[instIndex%val.length] : val
            }), {});

            // special handling for zmod
            ps.n = inst === 'zmod' ? mtf(ps.n) : n
            inst === 'zmod' && synth.set(`${ps.patch}.out(${channel},${channel + 1})`).start()

            // play
            synth.play(ps, time + (noteIndex * (strum/1000)));
        })
    })

    // set fx params on that channel
    const ch = getChannel(channel, out)
    ch.set(params, time);

    // handle busses
    busses.forEach((_, i: number) => {
        const gain = params[`bus${i}`] || 0;
        ch.send(i, gain, time);
    });

    // handle fx busses
    Object.keys(fxChannels).forEach((key: string, i: number) => {
        const gain = params[key] || 0;
        ch.sendFx(i, gain, time);
    })
}

export const handleSynthMutation = (time: number, params: Dictionary) => {
    const { lag=500, track, out = 0 } = params;
    const channel = track * 2

    const { n } = params
    const ps = n !== undefined
        ?  {...params, n: Array.isArray(n) ? n[0] : n}
        : params

    const store = get(synths)
    Object.entries(store[channel] || {})
        .forEach(([type, synth]: [string, any]) => {
            // special handling for zmod
            if(type === 'zmod' && ps.n) ps.n = mtf([ps.n].flat()[0])

            // mutate
            synth.mutate(ps, time, lag)
        })
    
    // mutate fx params on that channel
    const ch = getChannel(channel, out)
    ch.mutate(ps, time, lag);

    // handle busses
    busses.forEach((_, i: number) => {
        const gain = params[`bus${i}`] || 0;
        ch.send(i, gain, time);
    });

    // handle fx busses
    Object.keys(fxChannels).forEach((key: string, i: number) => {
        const gain = params[key] || 0;
        ch.sendFx(i, gain, time);
    })
}

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
fetchSamples('http://localhost:6060/samples.json')

const updateSynthsSamples = (synths: Dictionary) => {
    Object.values(synths).forEach(({sampler, granular, wavetable}) => 
        [sampler, granular, wavetable].forEach(synth => 
            synth && (synth.banks = {...synth.banks, ...get(samples)})
        ))
}

synths.subscribe((synths: Dictionary) => updateSynthsSamples(synths))

samples.subscribe((samples: Dictionary) => {
    updateSynthsSamples(get(synths))
    otoChannel.postMessage({ type: 'info', message: 'Sample banks ->\n' + Object.keys(samples).join(', ') + '\n'})
})