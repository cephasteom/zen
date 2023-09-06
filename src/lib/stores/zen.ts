import { writable, derived, get } from 'svelte/store';
import { addAction, addErrorAction } from '../zen';
import { handleEvent, handleMutation } from '../oto';
import type { ActionArgs } from '../zen/types';

export const editorValue = writable('');
export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const error = writable('');
export const isPlaying = writable(false);

export const visualsData = writable<Uint8Array>(new Uint8Array(16 * 16 * 4));

addAction((args: ActionArgs) => {
    const { t: time, c: cycle, q: quant, s: size, events, mutations, delta, v } = args;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        s.set(size);
        visualsData.set(v);
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