import { Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import Zen from './classes/Zen';
import Stream from './classes/Stream';
import { createCount } from './utils/utils';
import type { action } from './types';

export const code = writable('');
export const setCode = (str: string) => {
    code.set(str)
};
export const fallbackCode = writable('');

export const actions = writable<action[]>([])
export const addAction = (cb: action) => {
    actions.update(arr => [...arr, cb])
}

export const errorActions = writable<{(message: string) : void}[]>([])
export const addErrorAction = (cb: (message: string) => void) => {
    errorActions.update(arr => [...arr, cb])
}

let counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
export const z = new Zen();
export const streams: Stream[] = Array(8).fill(0).map((_, i) => new Stream('s' + i))
const [ s0, s1, s2, s3, s4, s5, s6, s7 ] = streams;

const loop = new Loop(time => {
    streams.forEach(stream => stream.reset())
    z.reset()
    
    // increment global time
    const t = counter()
    z.t = t;

    // global dimensions
    const { q, s, c } = z
    
    // evaluate the user's code, using fallback if it fails
    try {
        eval(get(code))
        fallbackCode.set(get(code))
    } catch (e: any) {
        console.log(e)
        get(errorActions).forEach(cb => cb(e.message))
        eval(get(fallbackCode))
    }
    
    // update dimensions and bpm
    const bpm = z.bpm.get(t, q) || 120
    loop.interval = `${z.q}n`
    Transport.bpm.setValueAtTime(bpm, time)

    // compile events and mutations
    const compiled = streams.map(stream => stream.get(z.t, z.q, z.s, bpm))
    const events = compiled.filter(({e}) => e)
    const mutations = compiled.filter(({m}) => m)
    
    // call actions
    const delta = (time - immediate()) * 1000
    get(actions).forEach(cb => cb(time, delta, events, mutations))

}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

let stops = 0;
export const stop = () => {
    stops++;
    Transport.stop(immediate())
    // reset counter if stopped twice
    !(stops%2) && (counter = createCount(0))
}