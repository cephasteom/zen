import { writable } from 'svelte/store';
import Zen from '$lib/zen/classes/Zen';
import { Loop, Transport, immediate } from 'tone'
import { z, addAction } from '$lib/zen';

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas

addAction(() => {
    t.set(z.t)
    c.set(z.c)
    q.set(z.q)
    s.set(z.s)
})