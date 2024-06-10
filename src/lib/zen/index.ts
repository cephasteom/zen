import { start, Loop, Transport, immediate, context } from 'tone'
import { WebMidi } from "webmidi";
import { initMidiClock } from './midi/clock';
import { writable, get } from 'svelte/store';
import { Zen } from './classes/Zen';
import { Data } from './classes/Data'
import { Stream } from './classes/Stream';
import { circuit } from './classes/Circuit';
import { Visuals } from './classes/Visuals';
import { createCount } from './utils/utils';
import { helpers } from './utils/helpers';
import keymap from './data/keymapping'
import { print as post, clear } from "$lib/stores/zen";
import { bpm, getBpm, clockSource, midiClockDevice, getClockSource, activeMidiClock } from "./stores";
import { modes } from './data/scales'
import { triads } from './data/chords'

// listen for incoming midi clock messages
// initMidiClock()

// Broadcast channels
const channel = new BroadcastChannel('zen')
const otoChannel = new BroadcastChannel('oto')

// Expect message about sample banks
const samplesMessage = writable('');
otoChannel.onmessage = ({data: {message}}) => message.includes('Sample banks') && samplesMessage.set(message)

// Code
export const lastCode = writable('');
export const code = writable('');
export const setCode = (str: string) => code.set(str + '\n' + Date.now());

const d = new Data();

// initialise Zen and Streams within the scope of the loop
const z = new Zen();
const streams: Stream[] = Array(12).fill(0).map((_, i) => new Stream('s' + i));
const fxstreams: Stream[] = Array(2).fill(0).map((_, i) => new Stream('fx' + i));
const v = new Visuals()
let measurements: number[] = []

// helper functions and constants
const { bts: initBts, btms: initBtms, clamp, seed } = helpers;
const { abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2 } = Math;
const print = (message: any) => post('info', message.toString())
const scales = () => post('info', 'Scales ->\n' + Object.keys(modes).join(', '))
const chords = () => post('info', 'Chords ->\n' + Object.keys(triads).join(', '))
const samples = () => post('info', get(samplesMessage))
const instruments = () => post('info', 'Instruments ->\n0: synth\n1: sampler\n2: granular\n3: additive\n4: acid\n5: drone\n6: sub\n7: superfm\n8: wavetable')
const midi = () => post('info', WebMidi.outputs.reduce((str, input, i) => `${str}${i}: ${input.name},\n`, ''))

// parse code when it changes
code.subscribe(code => {
    streams.forEach(stream => stream.reset())
    fxstreams.forEach(stream => stream.reset())
    z.reset()
    z.resetGlobals()
    circuit.clear()

    // global variables
    let { q, s, c } = z
    const bts = initBts(getBpm())
    const btms = initBtms(getBpm())
    const ms = btms
    
    // evaluate the user's code, using fallback if it fails
    // deconstruct streams from s0, to s127 in entirey
    const [ 
        s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15,
        s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31,
        s32, s33, s34, s35, s36, s37, s38, s39, s40, s41, s42, s43, s44, s45, s46, s47,
        s48, s49, s50, s51, s52, s53, s54, s55, s56, s57, s58, s59, s60, s61, s62, s63,
    ] = streams   
    const [
        fx0, fx1
    ] = fxstreams
    const map = keymap
    try {
        // prevent unused variable errors
        [bts, btms, ms, clamp, print, clear, scales, chords, samples, instruments, midi, seed];
        [abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2];
        [
            s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15,
            s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31,
            s32, s33, s34, s35, s36, s37, s38, s39, s40, s41, s42, s43, s44, s45, s46, s47,
            s48, s49, s50, s51, s52, s53, s54, s55, s56, s57, s58, s59, s60, s61, s62, s63
        ]; 
        [fx0, fx1];
        map; d;
        
        // TODO
        // const thisCode = !(t%z.update) ? code : get(lastCode) // only eval code on the beat
        eval(code)
        lastCode.set(code)
        
        // update clock source and midi clock
        const { src = 'internal', device = 0 } = z.getClock()
        clockSource.set(src === 'midi' ? 'midi' : 'internal')
        midiClockDevice.set(device)
    } catch (e: any) {
        post('error', e.message)
        eval(get(lastCode))
    }
})

// Run every division of a cycle to get event and mutation arguments
export function evaluate(count: number, time: number) {
    const t = z.getTime(count)
    const s = z.s
    const q = z.q
    const c = z.c

    // get seed value
    const seedValue = z.getSeed()
    seedValue !== null && seed(seedValue)

    // get latency value
    const latencyValue = z.getLatency()
    latencyValue !== null && (context.lookAhead = Math.floor(latencyValue/1000))
    
    // update loop and transport
    loop.interval = `${z.q}n`
    const newBpm = z.getBpm()
    if(newBpm !== getBpm()) {
        Transport.bpm.setValueAtTime(newBpm, time)
        bpm.set(newBpm)
    }
    Transport.swing = z.getSwing()
    // @ts-ignore
    Transport.swingSubdivision = `${z.getSwingN()}n`

    // build gates
    streams.forEach(stream => stream.wire.build(t, q))
    // routing for how wires should feed their outputs back into the inputs, if at all
    const feedback = streams.map(stream => stream.wire.feedback)
    const inputs = feedback.map((i) => i > -1 && i < measurements.length 
        ? measurements[i]
        : 0
    )
    
    circuit.run(inputs)
    const gates = circuit.gates
    measurements = circuit.measureAll()

    // compile parameters, events and mutations
    const compiled = [...streams, ...fxstreams].map(stream => stream.get(t, q, s, getBpm(), z))
    const soloed = compiled.filter(({solo}) => solo)
    const result = soloed.length ? soloed : compiled
    const events = result.filter(({e}) => e)
    const mutations = result.filter(({m}) => m)

    const vis = v.get(
        result
            .filter(({id}) => id.startsWith('s'))
            .map(({x,y,z,id,e,m}) => ({x,y,z,id,e: !!e,m: !!m}))
    )

    const grid = z.grid.get(t, q)

    // call actions
    const delta = (time - immediate())
    const args =  { time, delta, t, s, q, c, events, mutations, gates, measurements, feedback, inputs, v: vis, grid }
    channel.postMessage({ type: 'action', data: args })
}

// PLAYBACK USING TONE.JS
// Main application loop using Tone.js
let counter = createCount(0);
const loop = new Loop(time => { 
    const count = counter()
    evaluate(count, time)
}, `${z.q}n`).start(0)

// PLAYBACK USING EXTERNAL MIDI CLOCK

export const play = () => {
    if(getClockSource() === 'internal') return Transport.start('+0.1')
        
    Transport.stop(immediate())
    !get(activeMidiClock) && initMidiClock()
    activeMidiClock.set(true)
}
export const stop = () => {
    Transport.stop(immediate())
    counter = createCount(0)
}



export async function startAudio() {
    await start()    
    console.log('started audio')
    post('success', 'Started audio')
    window.removeEventListener('keydown', startAudio)
    window.removeEventListener('click', startAudio)
    window.removeEventListener('touchstart', startAudio)
}