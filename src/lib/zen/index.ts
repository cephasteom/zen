import { start, Loop, Transport, immediate, context } from 'tone'
import { WebMidi } from "webmidi";
import { initMidiClock } from './midi/clock';
import { initMidiTriggers } from './midi/triggers';
import { writable, get } from 'svelte/store';
import { Zen } from './classes/Zen';
import { Data } from './classes/Data'
import { Stream } from './classes/Stream';
import { circuit } from './classes/Circuit';
import { Visuals } from './classes/Visuals';
import { Wire } from './classes/Wire';
import { createCount } from './utils/utils';
import { helpers } from './utils/helpers';
import { print as post, clear } from "$lib/stores/zen";
import { nStreams, bpm, getBpm, clockSource, midiClockDevice, midiClockConfig, getClockSource, activeMidiClock, setQ, mode, midiTriggerDevice, getMode, setT } from "./stores";
import { modes } from './data/scales'
import { triads } from './data/chords'
import { loadSamples } from '$lib/oto';
import { Pattern } from './classes/Pattern';
import type { PatternMethod } from './types';

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

// Midi Triggers
initMidiTriggers()

/**
 * Add classes and methods to the window object to be accessed in the code editor
 */
// @ts-ignore
const z = new Zen(); window.z = z;
// @ts-ignore
const streams: Stream[] = Array(get(nStreams)).fill(0).map((_, i) => new Stream('s' + i)); window.streams = streams;
// @ts-ignore
streams.forEach(stream => window[stream.id] = stream)
// @ts-ignore
const fxstreams: Stream[] = Array(2).fill(0).map((_, i) => new Stream('fx' + i)); window.fxstreams = fxstreams;
// @ts-ignore
fxstreams.forEach(stream => window[stream.id] = stream)
// @ts-ignore
const qubits: Wire[] = Array(get(nStreams)).fill(0).map((_, i) => new Wire('q' + i)); window.qubits = qubits;
// @ts-ignore
qubits.forEach(wire => window[wire._id] = wire)

// @ts-ignore
const v = new Visuals(); window.v = v;
// @ts-ignore
const d = new Data(); window.d = d;

/**
 * Add all pattern methods to the window object, so they can be used to spawn new patterns
 */
Pattern.methods().forEach((method: string) => {
    // @ts-ignore
    const value = (...args: any[]) => {
        const p = new Pattern()
        return p.call(method as PatternMethod, ...args)
    }

    Object.defineProperty(window, `$${method}`, {
        value,            // Assign the function as the value
        writable: true,         // Prevents it from being overwritten
        enumerable: false,       // It won't show up in for...in loops
        configurable: false      // Prevents the property from being deleted or reconfigured
    });
})

/**
 * Add helper functions to the window object
 */
// @ts-ignore
const print = (message: any) => post('info', message.toString()); window.print = print;
// @ts-ignore
const scales = () => post('info', 'Scales ->\n' + Object.keys(modes).join(', ')); window.scales = scales;
// @ts-ignore
const chords = () => post('info', 'Chords ->\n' + Object.keys(triads).join(', ')); window.chords = chords;
// @ts-ignore
const samples = () => post('info', get(samplesMessage)); window.samples = samples;
// @ts-ignore
const instruments = () => post('info', 'Instruments ->\n0: synth\n1: sampler\n2: granular\n3: additive\n4: acid\n5: drone\n6: sub\n7: superfm\n8: wavetable'); window.instruments = instruments;
const midi = () => post('info', `Inputs ->\n${WebMidi.inputs.reduce((str, input, i) => `${str}${i}: ${input.name},\n`, '')}Outputs ->\n${WebMidi.outputs.reduce((str, output, i) => `${str}${i}: ${output.name},\n`, '')}`);
// @ts-ignore
window.midi = midi;
// @ts-ignore
window.clear = clear;
// @ts-ignore
window.loadSamples = loadSamples;
// @ts-ignore
const { bts: initBts, btms: initBtms, clamp, seed } = helpers;

// let printCircuit: string = ''
const exportCircuit = (format: string = 'qasm') => {
    return format === 'qasm'
        ? circuit.exportToQASM()
        : circuit.exportToQiskit()
} 
// @ts-ignore
window.exportCircuit = exportCircuit;
let measurements: number[] = []

/**
 * Whenever new code is received via the code editor, reset and re-evaluate the code
 */
code.subscribe(code => {
    streams.forEach(stream => stream.reset())
    fxstreams.forEach(stream => stream.reset())
    qubits.forEach(wire => wire.clear())
    z.reset()
    z.resetGlobals()
    circuit.clear()
    circuit.numQubits = 1

    // global variables
    let { q, s, c } = z
    const bts = initBts(getBpm())
    const btms = initBtms(getBpm())
    const ms = btms
    
    try {
        // prevent unused variable errors
        [bts, btms, ms, clamp, seed];
        
        eval(code)
        lastCode.set(code)
        
        // update clock source and midi clock
        const { src = 'internal', device = 0, srcBpm = 120, relativeBpm = false } = z.getClock()
        clockSource.set(src === 'midi' ? 'midi' : 'internal')
        midiClockDevice.set(device)
        midiClockConfig.set({ srcBpm, relativeBpm })

        const { trigger = 'division', device: midiDevice = 0 } = z.getMode()
        console.log('trigger', trigger)
        mode.set(trigger)
        midiTriggerDevice.set(midiDevice)
    } catch (e: any) {
        post('error', e.message)
        eval(get(lastCode))
    }
})

/**
 * This is the central function that is evaluated on every loop iteration
 */
export function evaluate(count: number, time: number) {
    const t = z.getTime(count)
    const s = z.s
    const q = z.q
    const c = z.c

    setQ(q)

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
    qubits.forEach(wire => wire.build(t, q))
    // routing for how qubits should feed their outputs back into the inputs, if at all
    const feedback = qubits.map(wire => wire.feedback)
    const inputs = feedback.map((i) => i > -1 && i < measurements.length 
        ? measurements[i]
        : 0
    )
    
    const gates = circuit.gates
    if(gates.flat().length) {
        circuit.run(inputs)
        measurements = circuit.measureAll()
    }

    // compile parameters, events and mutations
    const compiled = [...streams, ...fxstreams].map(stream => stream.get(t, q, s, getBpm(), z))
    const soloed = compiled.filter(({solo}) => solo)
    const result = soloed.length ? soloed : compiled
    const events = result.filter(({e}) => e)
    const mutations = result.filter(({m}) => m)

    const vis = v.get(
        result
            .filter(({id}) => id.startsWith('s'))
            .map(({x,y,z,id,e,m}) => ({x,y,z,id,e:!!e, m:!!m}))
    )

    const grid = z.grid.get(t, q)

    // call actions
    const delta = (time - immediate())
    const args =  { time, delta, t, s, q, c, events, mutations, gates, measurements, feedback, inputs, v: vis, grid }
    channel.postMessage({ type: 'action', data: args })
}

/**
 * Main app loop scheduled using internal clock
 */
let counter = createCount(0);
const loop = new Loop(time => { 
    const count = counter()
    setT(count)
    getMode() === 'division' && evaluate(count, time)
}, `${z.q}n`).start(0)

/**
 * Pay and stop functions
 */
export const play = () => {
    // if clock source is internal, start transport
    if(getClockSource() === 'internal') return Transport.start('+0.1')
        
    // otherwise, stop transport and listen for midi clock messages
    Transport.stop(immediate())
    !get(activeMidiClock) && initMidiClock()
    activeMidiClock.set(true)
}

export const stop = () => {
    Transport.stop(immediate())
    counter = createCount(0)
    activeMidiClock.set(false)
}

/**
 * Start audio context
 */
export async function startAudio() {
    await start()    
    console.log('started audio')
    post('success', 'Started audio')
    window.removeEventListener('keydown', startAudio)
    window.removeEventListener('click', startAudio)
    window.removeEventListener('touchstart', startAudio)
}