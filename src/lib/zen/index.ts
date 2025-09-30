import { start, Loop, immediate, getContext, getTransport } from 'tone'
import { WebMidi } from "webmidi";
import { initMidiClock } from './midi/clock';
import { initMidiTriggers } from './midi/triggers';
import { writable, get } from 'svelte/store';
import { Data } from './classes/Data'
import { Stream } from './classes/Stream';
import { circuit } from './classes/Circuit';
// import { Visuals } from './classes/Visuals';
import { Wire } from './classes/Wire';
import { createCount } from './utils/utils';
import { print, clear } from "$lib/stores/zen";
import { nStreams, bpm, getBpm, clockSource, midiClockDevice, midiClockConfig, getClockSource, activeMidiClock, setQ, mode, midiTriggerDevice, getMode, setT } from "./stores";
import { modes } from './data/scales'
import { triads } from './data/chords'
import { loadSamples } from '$lib/oto';
import { Pattern } from './classes/Pattern';
import type { PatternMethod } from './types';
import { seed } from './stores';

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

let measurements: number[] = []

/**
 * All classes and methods added to the scope object are made available in the code editor
 */
const scope: any = {
    z: new Stream('z'),
    streams: Array(get(nStreams)).fill(0).map((_, i) => new Stream('s' + i)),
    fxstreams: Array(2).fill(0).map((_, i) => new Stream('fx' + i)),
    qubits: Array(get(nStreams)).fill(0).map((_, i) => new Wire('q' + i)),
    // v: new Visuals(),
    d: new Data(),
    print: (message: any) => print('info', message.toString()),
    scales: () => print('info', 'Scales ->\n' + Object.keys(modes).join(', ')),
    chords: () => print('info', 'Chords ->\n' + Object.keys(triads).join(', ')),
    samples: () => print('info', get(samplesMessage)),
    instruments: () => print('info', 'Instruments ->\n0: synth\n1: sampler\n2: granular\n3: additive\n4: acid\n5: drone\n6: sub\n7: superfm\n8: wavetable'),
    midi: () => print('info', `Inputs ->\n${WebMidi.inputs.reduce((str, input, i) => `${str}${i}: ${input.name},\n`, '')}Outputs ->\n${WebMidi.outputs.reduce((str, output, i) => `${str}${i}: ${output.name},\n`, '')}`),
    clear,
    loadSamples,
    exportCircuit: (format: string = 'qasm') => {
        return format === 'qasm'
            ? circuit.exportToQASM()
            : circuit.exportToQiskit()
    },
};

/**
 * Add all streams and fxstreams to the scope object, so they can be used in the code editor
 */
[...scope.streams, ...scope.fxstreams].forEach((stream: Stream) => {
    // @ts-ignore
    scope[stream.id] = stream;
})

/**
 * Add all qubits to the scope object, so they can be used in the code editor
 */
scope.qubits.forEach((wire: Wire) => {
    scope[wire._id] = wire;
})

/**
 * Add all pattern methods to the window object, so they can be used to spawn new patterns
 */
Pattern.methods().forEach((method: string) => {
    // include method prefixed with $ for backwards compatibility
    [
        method, 
        `$${method}`
    ].forEach((name: string) => {
        // check if name is a protected word in javaScript
        if (['if', 'else'].includes(name)) return;

        scope[name] = (...args: any[]) => {
            const p = new Pattern()
            return p.call(method as PatternMethod, ...args)
        }
    })
})

// Alias for set function
scope.$ = scope.set

/**
 * Whenever new code is received via the code editor, reset and re-evaluate the code
 */
code.subscribe(code => {
    // global variables - these don't have to be accurate as we're only testing the code
    // divisions per cycle
    const q = Math.floor(scope.z.q.get(0, 16) || 16) // since q (divisions) is a pattern that requires a time and divisions, we assume time=0 and divisions=16
    // clock source
    const { src = 'internal', device = 0, srcBpm = 120, relativeBpm = false } = scope.z.clock.get(0, q) || {};
    // mode 
    const { trigger = 'division', device: midiDevice = 0 } = scope.z.mode.get(0, q) || {};

    scope.streams.forEach((stream: Stream) => stream.__clear())
    scope.fxstreams.forEach((stream: Stream) => stream.__clear())
    scope.qubits.forEach((wire: Wire) => wire.clear())
    scope.z.__clear()
    circuit.clear()
    circuit.numQubits = 1

    scope.btms = (beats: number) => (new Pattern()).set(beats).btms()
    
    try {
        new Function(...Object.keys(scope), code)(...Object.values(scope));
        lastCode.set(code)
        
        // update clock source and midi clock
        clockSource.set(src === 'midi' ? 'midi' : 'internal')
        midiClockDevice.set(device)
        midiClockConfig.set({ srcBpm, relativeBpm })

        // update mode and midi trigger device
        mode.set(trigger)
        midiTriggerDevice.set(midiDevice)
    } catch (e: any) {
        print('error', e.message)
        new Function(...Object.keys(scope), get(lastCode))(...Object.values(scope));
    }
})

/**
 * This is the central function that is evaluated on every loop iteration
 */
export function evaluate(count: number, time: number) {
    const { z, qubits } = scope
    const transport = getTransport()
    const context = getContext()

    const q = Math.floor(z.q.get(count, 16) || 16) // divisions per cycle
    const zT = z.t.get(count, q) 
    const t = zT !== null ? Math.floor(zT) : count
    const s = z.s.get(t, q) || 16 // size of canvas
    const c = z.c.get(t, q) || 0 // current cycle

    setQ(q)

    // get seed value
    const seedValue = z.seed.get(t, q) || null
    seedValue !== null && seed(seedValue)

    // get latency value
    const latencyValue = z.latency.get(t, q) || null
    latencyValue !== null && (context.lookAhead = Math.floor(latencyValue/1000))
    
    // update loop and transport
    loop.interval = `${q}n`
    const newBpm = z.bpm.get(t, q) || 120 // bpm

    if(newBpm !== getBpm()) {
        transport.bpm.setValueAtTime(newBpm, time)
        bpm.set(newBpm)
    }
    transport.swing = z.swing.get(t, q) || 0 // swing value
    // @ts-ignore
    transport.swingSubdivision = `${z.swingn.get(t, q) || 8}n`

    // build gates
    qubits.forEach((wire: Wire) => wire.build(t, q))
    // routing for how qubits should feed their outputs back into the inputs, if at all
    const feedback = qubits.map((wire: Wire) => wire.feedback)
    const inputs = feedback.map((i: number) => i > -1 && i < measurements.length 
        ? measurements[i]
        : 0
    )
    
    const gates = circuit.gates
    if(gates.flat().length) {
        circuit.run(inputs)
        measurements = circuit.measureAll()
    }

    // compile parameters, events and mutations
    const compiled = [...scope.streams, ...scope.fxstreams]
        .map(stream => stream.get(t, q, s, getBpm()))

    const soloed = compiled.filter(({solo}) => solo)
    const result = soloed.length ? soloed : compiled
    const events = result.filter(({e}) => e)
    const mutations = result.filter(({m}) => m)

    // const vis = scope.v.get(
    //     result
    //         .filter(({id}) => id.startsWith('s'))
    //         .map(({x,y,z,id,e,m}) => ({x,y,z,id,e:!!e, m:!!m}))
    // )

    // const grid = z.grid.get(t, q) || []
    const canvas = z.canvas.get(t, q, s, getBpm()) || null 

    // call actions
    const delta = (time - immediate())
    const args =  { 
        time, 
        delta, 
        t,
        s,
        q,
        c,
        events, 
        mutations, 
        gates, 
        measurements, 
        feedback, 
        inputs, 
        canvas
    }
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
}, `${scope.z.q.get(0,16)}n`).start(0)

/**
 * Pay and stop functions
 */
export const play = () => {
    const transport = getTransport()
    // if clock source is internal, start transport
    if(getClockSource() === 'internal') return transport.start('+0.1')
        
    // otherwise, stop transport and listen for midi clock messages
    transport.stop(immediate())
    !get(activeMidiClock) && initMidiClock()
    activeMidiClock.set(true)
}

export const stop = () => {
    const transport = getTransport()
    transport.stop(immediate())
    counter = createCount(0)
    setT(0)
    activeMidiClock.set(false)
}

/**
 * Start audio context
 */
export async function startAudio() {
    await start()    
    console.log('started audio')
    print('success', 'Started audio')
    window.removeEventListener('keydown', startAudio)
    window.removeEventListener('click', startAudio)
    window.removeEventListener('touchstart', startAudio)
}