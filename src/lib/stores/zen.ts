import { writable, derived } from 'svelte/store';
import { z, addAction } from '$lib/zen';

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const eventPositions = writable({});
export const mutationPositions = writable({});

// TODO: lots of garbage collection here. Can we use 
export const visualsData = derived([s, eventPositions, mutationPositions], ([s, eventPositions, mutationPositions]) => {
    const data = new Uint8Array(s * s * 4);
    
    for (let i = 0; i < s * s; i++) {
        data[i * 4 + 0] = 0;
        data[i * 4 + 1] = 0;
        data[i * 4 + 2] = 0;
        data[i * 4 + 3] = 255;
    }

    for (const { x, y } of Object.values(eventPositions)) {
        const i = (x + y * s) * 4;
        data[i + 0] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
    }

    for (const { x, y } of Object.values(mutationPositions)) {
        const i = (x + y * s) * 4;
        data[i + 0] = 255;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
    }
    return data;
});

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