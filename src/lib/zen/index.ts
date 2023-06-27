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
    // reset all streams to prevent unwanted parameters when user deletes code
    streams.forEach(stream => stream.reset())
    // reset Zen
    z.reset()
    
    // global time
    const t = counter()
    z.t = t;

    // global dimensions
    const { q, s } = z
    
    // evaluate the user's code
    try {
        eval(get(code))
    } catch (e: any) {
        // TODO: display error message to user
        get(errorActions).forEach(cb => cb(e.message))
    }
    
    // update dimensions and bpm
    loop.interval = `${z.q}n`
    Transport.bpm.setValueAtTime(z.bpm.get(z.t/z.q) || 120, time)

    // compile events and mutations
    const events = streams.map(stream => stream.get(z.t, z.q, z.s)).filter(({e}) => e)
    const mutations = streams.map(stream => stream.get(z.t, z.q, z.s)).filter(({m}) => m)
    
    // call any callbacks provided to Zen at exact time
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