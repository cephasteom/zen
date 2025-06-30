import { start, Loop, immediate, getContext, getTransport } from 'tone'
import { WebMidi } from "webmidi";
import { initMidiClock } from './midi/clock';
import { initMidiTriggers } from './midi/triggers';
import { writable, get } from 'svelte/store';
import { Zen } from './classes/Zen';
import { Data } from './classes/Data'
import { Stream } from './classes/Stream2';
import { circuit } from './classes/Circuit';
import { Visuals } from './classes/Visuals';
import { Wire } from './classes/Wire';
import { createCount } from './utils/utils';
import { helpers } from './utils/helpers';
import { print, clear } from "$lib/stores/zen";
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

// @ts-ignore
const { bts: initBts, btms: initBtms, clamp, seed } = helpers;

let measurements: number[] = []

/**
 * All classes and methods added to the scope object are made available in the code editor
 */
const scope: any = {
    z: new Zen(),
    streams: Array(get(nStreams)).fill(0).map((_, i) => new Stream('s' + i)),
    fxstreams: Array(2).fill(0).map((_, i) => new Stream('fx' + i)),
    qubits: Array(get(nStreams)).fill(0).map((_, i) => new Wire('q' + i)),
    v: new Visuals(),
    d: new Data(),
    print: (message: any) => print('info', message.toString()),
    scales: () => print('info', 'Scales ->\n' + Object.keys(modes).join(', ')),
    chords: () => print('info', 'Chords ->\n' + Object.keys(triads).join(', ')),
    samples: () => print('info', get(samplesMessage)),
    instruments: () => print('info', 'Instruments ->\n0: synth\n1: sampler\n2: granular\n3: additive\n4: acid\n5: drone\n6: sub\n7: superfm\n8: wavetable'),
    midi: () => print('info', `Inputs ->\n${WebMidi.inputs.reduce((str, input, i) => `${str}${i}: ${input.name},\n`, '')}Outputs ->\n${WebMidi.outputs.reduce((str, output, i) => `${str}${i}: ${output.name},\n`, '')}`),
    clear,
    loadSamples,
    clamp, 
    seed,
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
    scope.streams.forEach((stream: Stream) => stream.clear())
    scope.fxstreams.forEach((stream: Stream) => stream.clear())
    scope.qubits.forEach((wire: Wire) => wire.clear())
    scope.z.reset()
    scope.z.resetGlobals()
    circuit.clear()
    circuit.numQubits = 1

    // global variables
    scope.q = scope.z.q
    scope.s = scope.z.s
    scope.c = scope.z.c

    scope.bts = initBts(getBpm())
    scope.btms = initBtms(getBpm())
    scope.ms = scope.btms
    
    try {
        new Function(...Object.keys(scope), code)(...Object.values(scope));
        lastCode.set(code)
        
        // update clock source and midi clock
        const { src = 'internal', device = 0, srcBpm = 120, relativeBpm = false } = scope.z.getClock()
        clockSource.set(src === 'midi' ? 'midi' : 'internal')
        midiClockDevice.set(device)
        midiClockConfig.set({ srcBpm, relativeBpm })

        const { trigger = 'division', device: midiDevice = 0 } = scope.z.getMode()
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

    const t = z.getTime(count)
    const s = z.s
    const q = z.q
    const c = z.c

    setQ(z.q)

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
        transport.bpm.setValueAtTime(newBpm, time)
        bpm.set(newBpm)
    }
    transport.swing = z.getSwing()
    // @ts-ignore
    transport.swingSubdivision = `${z.getSwingN()}n`

    // build gates
    qubits.forEach((wire: Wire) => wire.build(z.getTime(count), z.q))
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
        .map(stream => stream.get(
            z.getTime(count), 
            z.q, 
            z.s, 
            getBpm(), 
            z
        )
    )

    const soloed = compiled.filter(({solo}) => solo)
    const result = soloed.length ? soloed : compiled
    const events = result.filter(({e}) => e)
    const mutations = result.filter(({m}) => m)

    const vis = scope.v.get(
        result
            .filter(({id}) => id.startsWith('s'))
            .map(({x,y,z,id,e,m}) => ({x,y,z,id,e:!!e, m:!!m}))
    )

    const grid = z.grid.get(z.getTime(count), z.q)

    // call actions
    const delta = (time - immediate())
    const args =  { 
        time, 
        delta, 
        t: z.getTime(count), 
        s: z.s, 
        q: z.q, 
        c: z.c, 
        events, 
        mutations, 
        gates, 
        measurements, 
        feedback, 
        inputs, 
        v: vis, 
        grid 
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
}, `${scope.z.q}n`).start(0)

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