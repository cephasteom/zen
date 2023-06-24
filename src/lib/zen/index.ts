import { Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import Zen from './classes/Zen';
import Stream from './classes/Stream';

export const z = new Zen();
export const streams = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'].reduce((obj, key) => ({
    ...obj,
    [key]: new Stream()
}), {})
export const code = writable('');
export const actions = writable<{ (): void; }[]>([]);

// add callback to be called at exact time of each loop
export const addAction = (cb: () => void) => {
    actions.update(arr => [...arr, cb])
}

const loop = new Loop(time => {
    // increment time TODO: should this be different to global time?
    z.t++;
    
    // ...evaluate code...
    
    // set various global parameters
    loop.interval = `${z.q}n`
    Transport.bpm.value = z.bpm.get(z.t/z.q)
    
    // call any callbacks provided to Zen at exact time
    const delta = (time - immediate()) * 1000
    setTimeout(() => get(actions).forEach(cb => cb()), delta);
    
}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

export const stop = () => Transport.stop(immediate())