import { WebMidi } from "webmidi";
import { getClockSource, getMidiClockDevice } from "../stores";
import { evaluate } from "..";
import { immediate } from "tone";

export function initMidiClock() {
    // TODO: make this configurable
    const q = 16;
    const ticksPerCycle = 24 * 4;
    const ticksPerDivision = ticksPerCycle/q;
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
                console.log("Start");
            });

            // @ts-ignore
            input.addListener("stop", "all", () => {
                isPlaying = false;
                console.log("Stop");
            });

            // @ts-ignore
            input.addListener("continue", "all", () => {
                isPlaying = true;
                console.log("Continue");
            })

            // @ts-ignore
            input.addListener("clock", "all", () => {
                // console.log(getMidiClockDevice(), i)
                if (!isPlaying 
                    || getClockSource() === 'internal' 
                    || getMidiClockDevice() !== i
                ) return;

                tickCount % ticksPerCycle === 0 
                    && console.log("Cycle: " + tickCount / ticksPerCycle);

                tickCount % ticksPerDivision === 0 
                    && evaluate(tickCount / ticksPerDivision, immediate())
                    // && console.log("Division: " + tickCount / ticksPerDivision);
                
                tickCount++;
            });
        });
    });
}