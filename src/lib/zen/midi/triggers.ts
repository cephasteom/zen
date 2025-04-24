import { WebMidi } from "webmidi";
import { mode, getMode, getMidiTriggerDevice } from "../stores";
import { evaluate } from "..";
import { immediate } from "tone";

export function initMidiTriggers() {
    // @ts-ignore
    WebMidi.enable(() => {
        // Listen to the MIDI clock on all available inputs
        WebMidi.inputs.forEach((input, i) => {
            // @ts-ignore
            input.addListener("noteon", "all", (e) => {
                if (getMode() !== 'noteon' || getMidiTriggerDevice() !== i) return;
                console.log('noteon', e.note.number);
                // evaluate(getT(), immediate());
            });
        });
    });
}