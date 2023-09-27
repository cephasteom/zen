import { WebMidi } from "webmidi";
import Midi from './classes/MIDI';
import type { Dictionary } from "./types";

// Enable Midi and log available devices
async function enableMidi() {
    await WebMidi.enable().then(() => {
        console.log('MIDI enabled')
        console.log('Available MIDI inputs: ' + WebMidi.inputs.map(i => i.name))
        console.log('Available MIDI outputs: ' + WebMidi.outputs.map(i => i.name))
    })
}
enableMidi();

// Create Midi class for each stream
const midiStreams:  { [key: string]: Midi } = new Array(8).fill(0)
    .map((_, i) => new Midi())
    .reduce((obj, stream, i) => ({
        ...obj,
        [`s${i}`]: stream
    }), {});

export function handleMidiEvent(delta: number, id: string, params: Dictionary) {
    const { cut, n = 60, strum = 0, midi } = params;
    
    const toCut = cut !== undefined ? [+cut].flat() : []
    toCut.forEach((id: number) => {
        midiStreams[`s${id}`]?.cut(delta);
    });

    console.log(midi)

    // handle multiple midi devices
    midi !== undefined && [midi].flat().forEach((midi: string, instIndex: number) => {
        // handle multiple notes
        [n].flat().forEach((n: number, noteIndex: number) => {
            const ps: Dictionary = Object.entries(params).reduce((obj, [key, val]) => ({
                ...obj,
                [key]: Array.isArray(val) ? val[instIndex%val.length] : val
            }), {});
            ps.n = n
            ps.midi = midi;
            midiStreams[id].trigger(ps, delta + (noteIndex * (strum/1000)));
        })
    })
}

export function handleMidiMutation(delta: number, id: string, params: Dictionary) {
    midiStreams[id].mutate(params, delta);
}