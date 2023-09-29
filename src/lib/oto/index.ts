import { handleMidiEvent, handleMidiMutation } from "./handleMidi";
import { handleSynthEvent, handleSynthMutation } from "./handleSynths";
import type { Dictionary } from "./types";

const channel = new BroadcastChannel('zen');

// Listen for actions from Zen
channel.onmessage = ({data: {action}}) => {
    if(!action) return
    const { time, delta, events, mutations } = action;
    events.forEach(({id, eparams}) => {
        handleEvent(time, delta, id, eparams);
    })

    mutations.forEach(({id, mparams}) => {
        handleMutation(time, delta, id, mparams);
    })
}

export function handleEvent(time: number, delta: number, id: string, params: Dictionary) {
    handleMidiEvent(delta, id, params);
    handleSynthEvent(time, id, params);
}

export function handleMutation(time: number, delta: number, id: string, params: Dictionary) {
    params.midi && handleMidiMutation(delta, id, params);
    handleSynthMutation(time, id, params);
}