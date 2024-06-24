import { handleMidiEvent, handleMidiMutation } from "./handleMidi";
import { handleSynthEvent, handleSynthMutation } from "./handleSynths";
import { handleFxEvent, handleFxMutation } from "./handleFx";
import { samples } from "./stores";
import type { Dictionary } from "./types";

const channel = new BroadcastChannel('zen');

// Listen for actions from Zen
channel.onmessage = ({data: {type, data}}) => {
    if(type !== 'action') return
    const { time, delta, events, mutations } = data;
    // @ts-ignore
    events.forEach(({id, eparams}) => {
        handleEvent(time, delta, id, eparams);
    })
    
    // @ts-ignore
    mutations.forEach(({id, mparams}) => {
        handleMutation(time, delta, id, mparams);
    })
}

export function handleEvent(time: number, delta: number, id: string, params: Dictionary) {
    handleMidiEvent(delta, id, params);
    id.startsWith('s') && handleSynthEvent(time, params);
    id.startsWith('fx') && handleFxEvent(time, id, params);
}

export function handleMutation(time: number, delta: number, id: string, params: Dictionary) {
    params.midi && handleMidiMutation(delta, id, params);
    id.startsWith('s') && handleSynthMutation(time, params);
    id.startsWith('fx') && handleFxMutation(time, id, params);
}

/**
 * Load samples into the store
 * @param samples
 * Should be an object with keys as bank names and values as arrays of urls
 */
export function loadSamples(samps: Dictionary) {
    samples.update((currentSamples: Dictionary) => {
        // Iterate over each key in samps
        Object.keys(samps).forEach((key) => {
            currentSamples[key]
                // If the key exists in currentSamples, append the new items
                ? (currentSamples[key] = [...currentSamples[key], ...samps[key]])
                // If the key doesn't exist, add the new key-value pair
                : (currentSamples[key] = samps[key])
            }
        );
        return { ...currentSamples };
    });
}