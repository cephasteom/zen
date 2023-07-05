import { writable, derived, get } from 'svelte/store';
import { addAction, addErrorAction } from '$lib/zen';
import { handleEvent, handleMutation } from '$lib/oto';
import type { ActionArgs } from '$lib/zen/types';

export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const eventPositions = writable<{id: string, x: number, y: number, z: number}[]>([]);
export const mutationPositions = writable<{id: string, x: number, y: number, z: number}[]>([]);
export const error = writable('');
export const isPlaying = writable(false);

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

addAction((args: ActionArgs) => {
    const { t: time, c: cycle, q: quant, s: size, events, mutations, delta } = args;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        s.set(size);
        eventPositions.set(events.map(({id,x,y,z}) => ({id,x,y,z})));
        mutationPositions.set(mutations.map(({id,x,y,z}) => ({id,x,y,z})));      
    }, delta * 1000);
})

addAction((args: ActionArgs) => {
    const { time, delta, events, mutations } = args;
    events.forEach(({id, eparams}) => {
        handleEvent(time, delta, id, eparams);
    })

    mutations.forEach(({id, mparams}) => {
        handleMutation(time, delta, id, mparams);
    }
)})

addErrorAction((message: string) => {
    // if error does not equal message, set error
    get(error) !== message && error.set(message);
})