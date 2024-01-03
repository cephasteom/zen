import { writable, derived, get } from 'svelte/store';
import { WebMidi } from "webmidi";
import { debounce } from '../utils/utils';

// control changes in
const inputs = writable<string[]>([]);
const CCsIn = writable<{ [device: string]: { [cc: string]: number } }>({});
const notes = writable<{ [device: string]: number[] }>({});

inputs.subscribe(inputs => {
    CCsIn.set(inputs.reduce((obj, input) => ({
        ...obj,
        [input]: {}
    }), {}))

    notes.set(inputs.reduce((obj, input) => ({
        ...obj,
        [input]: []
    }), {}))
})

export const getCC = (cc: number, deviceIndex = 0) => {
    const device = get(inputs)[deviceIndex] || get(inputs)[0]
    return get(CCsIn)[device]?.[cc]
}

export const getNotes = (deviceIndex = 0) => {
    const device = get(inputs)[deviceIndex] || get(inputs)[0]
    return get(notes)[device] || []
}

WebMidi.enable().then(() => {
    inputs.set(WebMidi.inputs.map(i => i.name))
    WebMidi.inputs.forEach((input) => {
        const updateCCs = debounce((e) => {
            CCsIn.update(CCs => ({
                ...CCs,
                [input.name]: {
                    ...CCs[input.name],
                    [e.controller.number]: e.value
                }
            }))
        }, 10);

        input.addListener('controlchange', updateCCs);

        // listen for note on/off
        input.addListener('noteon', (e) => {
            notes.update(notes => ({
                ...notes,
                [input.name]: [...notes[input.name], e.note.number]
            }))
        })

        input.addListener('noteoff', (e) => {
            notes.update(notes => ({
                ...notes,
                [input.name]: notes[input.name].filter(n => n !== e.note.number)
            }))
        })
    })
})