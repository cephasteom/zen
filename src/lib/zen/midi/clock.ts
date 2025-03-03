import { WebMidi } from "webmidi";
import { getClockSource, getMidiClockDevice, getActiveMidiClock, getBpm, getQ } from "../stores";
import { euclidean } from "../parsing/euclidean-rhythms";
import { evaluate } from "..";
import { immediate } from "tone";

export function initMidiClock() {
    // @ts-ignore
    WebMidi.enable(() => {
        // Listen to the MIDI clock on all available inputs
        WebMidi.inputs.forEach((input, i) => {
            let tickCount = 0;
            let isPlaying = false;

            // @ts-ignore
            input.addListener("start", "all", () => {
                tickCount = 0;
                isPlaying = true;
            });

            // @ts-ignore
            input.addListener("stop", "all", () => {
                isPlaying = false;
            });

            // @ts-ignore
            input.addListener("continue", "all", () => {
                isPlaying = true;
            })

            // @ts-ignore
            input.addListener("clock", "all", (clock) => {
                if (!isPlaying 
                    || !getActiveMidiClock()
                    || getClockSource() === 'internal' 
                    || getMidiClockDevice() !== i
                ) return;

                const q = getQ();
                const ticksPerCycle = 96;
                const ticksPerDivision = Math.floor(ticksPerCycle/q);

                const beats = euclidean(q, ticksPerCycle);

                beats[tickCount % ticksPerCycle]
                    && evaluate(tickCount / ticksPerDivision, immediate())
                
                tickCount++;
            });
        });
    });
}