import { Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import Zen from './classes/Zen';
import Stream from './classes/Stream';
import { createCount, validateJSString } from './utils/utils';

export const code = writable('');
export const setCode = (str: string) => {
    const { isValid, error } = validateJSString(str)
    // TODO: display error
    isValid && code.set(str)
};

export const actions = writable<{ (): void; }[]>([]);
export const addAction = (cb: () => void) => {
    actions.update(arr => [...arr, cb])
}

const counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
export const z = new Zen();
export const streams: Stream[] = Array(8).fill(0).map((_, i) => new Stream('s' + i))
const [ s0, s1, s2, s3, s4, s5, s6, s7 ] = streams;

const loop = new Loop(time => {
    // reset all streams to prevent unwanted parameters when user deletes code
    streams.forEach(stream => stream.reset())
    
    // global time
    const t = counter()
    z.t = t;

    // global dimensions
    const { q, s } = z
    
    // evaluate the user's code
    eval(get(code))
    
    // update dimensions and bpm
    loop.interval = `${z.q}n`
    Transport.bpm.setValueAtTime(z.bpm.get(z.t/z.q) || 120, time)

    // compile parameters for each stream
    const params = streams.map(stream => stream.get(z.t, z.q, z.s))
        .filter(result => result.e || result.m)
        .reduce((obj, result) => ({
            ...obj,
            [result.id]: result
        }), {})

    // TODO: send params to synth engine / midi engine / etc
    
    // call any callbacks provided to Zen at exact time
    const delta = (time - immediate()) * 1000
    setTimeout(() => get(actions).forEach(cb => cb()), delta);
    
}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

export const stop = () => Transport.stop(immediate())