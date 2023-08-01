import { handleMidiEvent, handleMidiMutation } from "./handleMidi";
import { handleSynthEvent, handleSynthMutation } from "./handleSynths";
import type { Dictionary } from "./types";

export function handleEvent(time: number, delta: number, id: string, params: Dictionary) {
    const { nudge } = params;
    time += +nudge/1000 || 0;
    delta += +nudge/1000 || 0;
    handleMidiEvent(delta, id, params);
    handleSynthEvent(time, id, params);
}

export function handleMutation(time: number, delta: number, id: string, params: Dictionary) {
    params.midi && handleMidiMutation(delta, id, params);
    handleSynthMutation(time, id, params);
}