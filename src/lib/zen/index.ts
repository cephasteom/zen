import { Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import Zen from './classes/Zen';
import Stream from './classes/Stream';
import { createCount } from './utils/utils';

export const code = writable('');
export const setCode = (str: string) => code.set(str); // TODO: validate

export const actions = writable<{ (): void; }[]>([]);
export const addAction = (cb: () => void) => {
    actions.update(arr => [...arr, cb])
}

const counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
export const z = new Zen();
export const streams = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'].reduce((obj, key) => ({
    ...obj,
    [key]: new Stream()
}), {})
const { s0, s1, s2, s3, s4, s5, s6, s7 } = streams;

const loop = new Loop(time => {
    // global time
    const t = counter()
    z.t = t;
    
    eval(get(code))
    
    // set various global parameters
    loop.interval = `${z.q}n`
    Transport.bpm.setValueAtTime(z.bpm.get(z.t/z.q), time)

    // TODO: this will require garbage collection
    const params = Object.entries(streams).reduce((obj, [key, stream]) => ({
        ...obj,
        [key]: stream.get(z.t, z.q, z.s)
    }), {})

    console.log(params.s0.params.n)
    
    // call any callbacks provided to Zen at exact time
    const delta = (time - immediate()) * 1000
    setTimeout(() => get(actions).forEach(cb => cb()), delta);
    
}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

export const stop = () => Transport.stop(immediate())