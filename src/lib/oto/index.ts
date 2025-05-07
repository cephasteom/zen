import { handleMidiEvent, handleMidiMutation } from "./handleMidi";
import { handleSynthEvent, handleSynthMutation, handleStop } from "./handleSynths";
import { handleFxEvent, handleFxMutation } from "./handleFx";
import { samples } from "./stores";
import type { Dictionary } from "./types";

const channel = new BroadcastChannel('zen');

// Listen for actions from Zen
channel.onmessage = ({data: {type, data}}) => {
    if(!['action', 'stop'].includes(type)) return

    if(type === 'stop') return handleStop()

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

function handleEvent(time: number, delta: number, id: string, params: Dictionary) {
    handleMidiEvent(delta, id, params);
    id.startsWith('s') && handleSynthEvent(time, params);
    id.startsWith('fx') && handleFxEvent(time, id, params);
}

function handleMutation(time: number, delta: number, id: string, params: Dictionary) {
    handleMidiMutation(delta, id, params);
    id.startsWith('s') && handleSynthMutation(time, params);
    id.startsWith('fx') && handleFxMutation(time, id, params);
}

/**
 * Load samples into the store
 * @param samples
 * Should be an object with keys as bank names and values as arrays of urls
 * @param baseUrl
 * An optional base url to prepend to each url
 */
export function loadSamples(samps: Dictionary, baseUrl: string) {
    samples.update((currentSamples: Dictionary) => {
        // Iterate over each key in samps
        Object.keys(samps).forEach((key) => {
            const bank = samps[key].map((url: string) => baseUrl ? `${baseUrl}/${url}` : url)
            currentSamples[key]
                // If the key exists in currentSamples, append the new items
                ? (currentSamples[key] = [...currentSamples[key], ...bank])
                // If the key doesn't exist, add the new key-value pair
                : (currentSamples[key] = bank)
            }
        );
        return { ...currentSamples };
    });
}