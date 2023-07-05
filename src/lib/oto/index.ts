import { WebMidi } from "webmidi";
import Midi from './classes/MIDI';

/**
 * Enable Midi and generate a stream for each device
**/
async function enableMidi() {
    await WebMidi.enable().then(() => {
        console.log('MIDI enabled')
        console.log('Available MIDI inputs: ' + WebMidi.inputs.map(i => i.name))
        console.log('Available MIDI outputs: ' + WebMidi.outputs.map(i => i.name))
    })
}
enableMidi();

const midiStreams:  { [key: string]: Midi } = new Array(8).fill(0)
    .map((_, i) => new Midi())
    .reduce((obj, stream, i) => ({
        ...obj,
        [`s${i}`]: stream
    }), {});

/**
 * Event handlers
**/
export function handleEvent(time: number, delta: number, id: string, params: any) {
    const { cut, n = 60, strum = 0, midi } = params;
    
    const toCut = cut !== undefined ? [+cut].flat() : []
    toCut.forEach((id: number) => {
        midiStreams[`s${id}`].cut(delta);
    });

    // handle multiple midi devices
    [midi].flat().forEach((midi: string, instIndex: number) => {
        // handle multiple notes
        [n].flat().forEach((n: number, noteIndex: number) => {
            const ps = Object.entries(params).reduce((obj, [key, val]) => ({
                ...obj,
                [key]: Array.isArray(val) ? val[instIndex%val.length] : val
            }), {});
            ps.n = n
            ps.midi = midi;
            midiStreams[id].trigger(ps, delta + (noteIndex * strum));
        })
    })
}

export function handleMutation(time: number, delta: number, id: string, params: any) {
    params.midi && midiStreams[id].mutate(params, delta);
}