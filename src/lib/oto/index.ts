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

export function handleEvent(time: number, id: string, params: any) {
    const { cut, n = 60, strum = 0 } = params;
    
    const toCut = cut !== undefined ? [+cut].flat() : []
    toCut.forEach((id: number) => {
        midiStreams[`s${id}`].cut(time);
    });

    
    // TODO: [midi].flat().map...
    [n].flat().forEach((n: number, i: number) => {
        // handle multiple notes and params
        const ps = Object.entries(params).reduce((obj, [key, val]) => ({
            ...obj,
            [key]: Array.isArray(val) ? val[i%val.length] : val
        }), {});
        
        params.midi && midiStreams[id].trigger(ps, time + (i * strum));
    })

}

export function handleMutation(time: number, id: string, params: any) {
    params.midi && midiStreams[id].mutate(params, time);
}