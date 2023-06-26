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

const counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
export const z = new Zen();
export const streams: Stream[] = Array(8).fill(0).map((_, i) => new Stream('s' + i))
const [ s0 ] = streams;

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
        console.log(e.message)
    }
    
    // update dimensions and bpm
    loop.interval = `${z.q}n`
    Transport.bpm.setValueAtTime(z.bpm.get(z.t/z.q) || 120, time)

    // compile parameters for each stream
    const params = streams.map(stream => stream.get(z.t, z.q, z.s))
        .filter(({e, m}) => e || m)
        .reduce((obj, result) => ({
            ...obj,
            [result.id]: result
        }), {})

    // TODO: send params to synth engine / midi engine / etc
    
    // call any callbacks provided to Zen at exact time
    const delta = (time - immediate()) * 1000
    get(actions).forEach(cb => cb(time, delta, params))
}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

export const stop = () => Transport.stop(immediate())