import { writable, derived, get } from 'svelte/store';
import { z, addAction, addErrorAction } from '$lib/zen';
import { handleEvent, handleMutation } from '$lib/oto';

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const eventPositions = writable({});
export const mutationPositions = writable({});
export const error = writable('');

// TODO: lots of garbage collection here. Can we use 
export const visualsData = derived([s, eventPositions, mutationPositions], ([s, eventPositions, mutationPositions]) => {
    const data = new Uint8Array(s * s * 4);
    
    for (let i = 0; i < s * s; i++) {
        data[i * 4 + 0] = 0;
        data[i * 4 + 1] = 0;
        data[i * 4 + 2] = 0;
        data[i * 4 + 3] = 0;
    }

    // event rgb(255, 105, 90)
    for (const { x, y } of Object.values(eventPositions)) {
        const i = ((Math.floor(y) * s) + Math.floor(x)) * 4;
        data[i + 0] = 255;
        data[i + 1] = 105;
        data[i + 2] = 90;
        data[i + 3] = 255;
    }

    // mutation rgb(229, 0, 127)
    for (const { x, y } of Object.values(mutationPositions)) {
        const i = ((Math.floor(y) * s) + Math.floor(x)) * 4;
        data[i + 0] = 229;
        data[i + 1] = 0;
        data[i + 2] = 127;
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

addAction((time: number, delta: number, events: { [key: string]: any }[], mutations: { [key: string]: any }[]) => {
    events.forEach(({id, eparams}) => {
        handleEvent(time, id, eparams);
    })

    mutations.forEach(({id, mparams}) => {
        handleMutation(time, id, mparams);
    }
)})

addErrorAction((message: string) => {
    // if error does not equal message, set error
    get(error) !== message && error.set(message);
})