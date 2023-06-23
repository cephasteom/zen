import { writable } from 'svelte/store';
import Zen from '$lib/zen/classes/Zen';
import { Loop, Transport, immediate } from 'tone'

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const code = writable('');

export const z = new Zen();
// test
z.bpm.range(60, 180, 0.5)

const loop = new Loop(time => {
    // increment time
    z.t++;
    
    // ...evaluate code...
    
    // set various global parameters
    loop.interval = `${z.q}n`
    Transport.bpm.value = z.bpm.get(z.t/z.q)
    
    const delta = (time - immediate()) * 1000
    setTimeout(() => {
        t.set(z.t)
        c.set(z.c)
        q.set(z.q)
        s.set(z.s)
    }, delta);

    // TODO: handle q changes
}, `${z.q}n`).start(0)

export const start = () => Transport.start('+0.1')

export const stop = () => Transport.stop(immediate())