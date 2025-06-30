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
    handleMidiMutation(delta, id, params);
    id.startsWith('s') && handleSynthMutation(time, params);
    id.startsWith('fx') && handleFxMutation(time, id, params);
}

/**
 * Load samples into the store
 * @param samples
 * Should be an object with keys as bank names and values as arrays of urls, or the url of a json file containing such an object
 * @param baseUrl
 * An optional base url to prepend to each url
 * @example
 * loadSamples({
 *   drums: ['kick.wav', 'snare.wav'],
 *   bass: ['bass.wav']
 * }, 'https://example.com/samples')
 * @example
 * loadSamples('https://example.com/samples.json', 'https://example.com')
 * @returns void
 */
export function loadSamples(samps: Dictionary | string, baseUrl: string) {
    try {
        // If samps is a string, assume it's a URL to a JSON file
        if (typeof samps === 'string') {
            fetch(samps)
                .then(response => response.json())
                // Call the function recursively with the fetched data
                .then(data => loadSamples(data, baseUrl))
                .catch(error => console.error('Error loading samples:', error));
            return;
        }
        // If samps is an object, proceed to update the samples store
        samples.update((currentSamples: Dictionary) => {
            // Iterate over each key in samps
            Object.keys(samps).forEach((key) => {
                const urls = samps[key]
                // If the key is not an array, skip it
                if (!Array.isArray(urls)) return
                
                const bank = urls.map((url: string) => baseUrl ? `${baseUrl}/${url}` : url)
                currentSamples[key]
                    // If the key exists in currentSamples, append the new items
                    ? (currentSamples[key] = [...currentSamples[key], ...bank])
                    // If the key doesn't exist, add the new key-value pair
                    : (currentSamples[key] = bank)
                }
            );
            return { ...currentSamples };
        });
    } catch (error) {
        console.error('Error loading samples:', error);
    }
}