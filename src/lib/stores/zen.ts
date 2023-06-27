import { writable } from 'svelte/store';
import { z, addAction } from '$lib/zen';

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const eventPositions = writable({});
export const mutationPositions = writable({});

eventPositions.subscribe(console.log);

addAction((time: number, delta: number, events: { [key: string]: any }[], mutations: { [key: string]: any }[]) => {
    setTimeout(() => {
        t.set(z.t);
        c.set(z.c);
        q.set(z.q);
        s.set(z.s);
        eventPositions.set(events.map(({id,x,y,z}) => ({id,x,y,z})));
        mutationPositions.set(mutations.map(({id,x,y,z}) => ({id,x,y,z})));
        
    }, delta);
    
})