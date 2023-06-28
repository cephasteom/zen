import { WebMidi } from "webmidi";
import Midi from './classes/MIDI';

async function enableMidi() {
    await WebMidi.enable().then(() => {
        console.log('MIDI enabled')
        console.log('Available MIDI inputs: ' + WebMidi.inputs.map(i => i.name))
        console.log('Available MIDI outputs: ' + WebMidi.outputs.map(i => i.name))
    })
}

enableMidi();

const midiStreams = new Array(8).fill(0).map((_, i) => new Midi());
console.log(midiStreams)


export function handleEvent(time: number, id: string, params: any) {
    params.midi && handleMidi(time, id, params);
    // console.log('event', time, id, params)
}

export function handleMutation(time: number, id: string, params: any) {
    params.midi && handleMidi(time, id, params);
    const mutable = Object.entries(params)
        .filter(([key]) => key.startsWith('_'))
        .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
        }), {});

    // console.log('mutation', time, id, mutable)
}

export function handleMidi(time: number, id: string, params: any) {
    // console.log('midi', time, id, params)
}