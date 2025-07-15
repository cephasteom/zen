import { WebMidi } from "webmidi";
import { getMode, getClockSource, getMidiClockDevice, getActiveMidiClock, getMidiClockConfig, getBpm, getQ, setT } from "../stores";
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
                const zenBpm = getBpm(); // Zen's BPM
                const { srcBpm, relativeBpm } = getMidiClockConfig(); // MIDI clock BPM, whether to set Zen's BPM relative to MIDI clock BPM, or ignore it
                const ticksPerCycle = relativeBpm ? Math.round((srcBpm / zenBpm) * 96) : 96;

                const beats = euclidean(q, ticksPerCycle);
                const cycle = Math.floor(tickCount / ticksPerCycle);
                const t = (cycle * q) + beats
                    .slice(0, tickCount % ticksPerCycle)
                    .reduce((acc: number, curr: number) => acc + curr, 0);

                setT(t);
                getMode() !== 'noteon'
                && beats[tickCount % ticksPerCycle]
                && evaluate(t, immediate())
                
                tickCount++;
            });
        });
    });
}