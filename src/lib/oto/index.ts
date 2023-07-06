import type { Dictionary } from "./types";
import { handleMidiEvent, handleMidiMutation } from "./handleMidi";
import { handleSynthEvent, handleSynthMutation } from "./handleSynths";

export function handleEvent(time: number, delta: number, id: string, params: Dictionary) {
    params.midi && handleMidiEvent(delta, id, params);
    params.inst && handleSynthEvent(time, id, params);
}

export function handleMutation(time: number, delta: number, id: string, params: Dictionary) {
    params.midi && handleMidiMutation(delta, id, params);
    handleSynthMutation(time, id, params);
}