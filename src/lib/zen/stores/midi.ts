import { writable, get } from 'svelte/store';
import { WebMidi } from "webmidi";
import { debounce } from '../utils/utils';

// control changes in
export const inputs = writable<string[]>([]);
export const CCsIn = writable<{ [key: string]: { [key: string]: number } }>({});

export const getCC = (cc: number, deviceIndex = 0) => {
    const device = get(inputs)[deviceIndex] || get(inputs)[0]
    return get(CCsIn)[device]?.[cc] || 0
}

WebMidi.enable().then(() => {
    inputs.set(WebMidi.inputs.map(i => i.name))
    WebMidi.inputs.forEach((input) => {
        const update = debounce((e) => {
            CCsIn.update(CCs => ({
                ...CCs,
                [input.name]: {
                    ...CCs[input.name],
                    [e.controller.number]: e.value
                }
            }))
        }, 10); // 200ms debounce time

        input.addListener('controlchange', update);
    })
})