import { Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import Zen from './classes/Zen';
import Stream from './classes/Stream';
import { createCount } from './utils/utils';
import type { action } from './types';
import keymap from './data/keymapping'

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
const map = keymap

const loop = new Loop(time => {
    // increment global time
    let t = counter()

    streams.forEach(stream => stream.reset())
    z.reset(t)

    // global variables
    let { q, s, c } = z
    
    // evaluate the user's code, using fallback if it fails
    try {
        eval(get(code))
        fallbackCode.set(get(code))
    } catch (e: any) {
        get(errorActions).forEach(cb => cb(e.message))
        eval(get(fallbackCode))
    }
    
    // reassign global variables in case the user has changed them
    t = z.getTime()
    s = z.s
    q = z.q
    c = z.c
    const bpm = z.getBpm()

    // update loop and transport
    loop.interval = `${q}n`
    Transport.bpm.setValueAtTime(bpm, time)

    // compile events and mutations
    const compiled = streams.map(stream => stream.get(t, q, s, bpm))
    const events = compiled.filter(({e}) => e)
    const mutations = compiled.filter(({m}) => m)
    
    // call actions
    const delta = (time - immediate()) * 1000
    const data = { time, t, s, q, c, delta, events, mutations }
    get(actions).forEach(cb => cb(data))

}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

let stops = 0;
export const stop = () => {
    stops++;
    Transport.stop(immediate())
    // reset counter if stopped twice
    !(stops%2) && (counter = createCount(0))
}