import { WebMidi, Output } from "webmidi";
import { mapToStepRange } from '../utils/utils'
import type { params } from '../types'

class Midi {
    history: any = {}
    inputs: string[] = []
    outputs: string[] = []
    // Having to manage own note offs as we are unable to clear queued notes. See https://bugs.chromium.org/p/chromium/issues/detail?id=471798
    noteoffs: { [note: string]: number | NodeJS.Timeout } = {}
    
    constructor() {
        this.init();
    }

    async init() {
        await WebMidi.enable().then(() => {
            this.inputs = WebMidi.inputs.map(i => i.name)
            this.outputs = WebMidi.outputs.map(i => i.name)
        })
    }

    // keep track of notes and ccs for each device
    storeHistory(note: number, ccs: {}[], device?: Output, channels?: number[] | undefined, mididelay?: number) {
        const history = this.history || {}
        device && (history.device = device);
        channels && (history.channels = channels);
        note && (history.notes = [...(history.notes || []), note]);
        ccs && (history.ccs = [...(history.ccs || []), ...ccs]);
        mididelay && (history.mididelay = mididelay);
        this.history = history
    }

    getCCsFromParams(params: { [key: string]: number | string } = {}): {cc: number, value: number}[] {
        return Object.keys(params).reduce((arr: {cc: number, value: number}[], key: string) => {
            const isCC = key.startsWith('cc')
            return isCC
                ? [...arr, {
                    cc: +key.replace('cc', ''), 
                    value: mapToStepRange(+params[key], 0, 1, 0, 127, 1)
                }] 
                : arr
        }, []);
    }

    // accepts a single note
    trigger(params: { [key: string]: number | string } = {}, delta: number) {
        const { midi, midichan, mididelay = 0, n, dur = 1000, amp = 0.5, nudge = 0 } = params;

        const name = this.outputs[+midi]
        if(!name) return;

        const note = n || 60;
        const channels = midichan ? (Array.isArray(midichan) ? midichan : [+midichan]) : undefined;
        const device = WebMidi.getOutputByName(name);
        const timestamp = (delta * 1000) + +mididelay + +nudge

        const options = {
            time: `+${timestamp}`,
            attack: +amp,
            channels,
        }

        // if note is already playing, send note off
        this.noteoffs[note] && clearTimeout(this.noteoffs[note] as NodeJS.Timeout);

        const id = setTimeout(() => {
            device.stopNote(note, {channels});
            this.history.notes = this.history.notes.filter((n: number) => n !== note);
            delete this.noteoffs[note]
        }, timestamp + +dur);

        this.noteoffs = { ...this.noteoffs, [note]: id }

        // Play note
        device.playNote(note, {...options, time: `+${timestamp}`});

        // get ccs from params
        const ccs = this.getCCsFromParams(params);

        // send ccs
        ccs.forEach(({cc, value}) => {
            const prev = this.history.ccs || {}
            if(prev[cc] === value) return

            device.sendControlChange(cc, value, options)
        })

        this.storeHistory(+note, ccs, device, channels, +mididelay);
    }


    cut(delta: number) {
        if(!this.history.device) return;
        
        const mididelay = this.history.mididelay || 0;
        
        const options = {
            time: `+${(delta * 1000) + mididelay - 10}`,
            ...this.history
        }
        
        this.history.device.sendNoteOff(this.history.notes, options);
        this.history.notes = [];
    }

    mutate(params: params, delta: number) {
        if(!this.history.device) return;
        
        const { mididelay = 0, nudge = 0 } = params;
        
        const timestamp = (delta * 1000) + +mididelay - 10 + +nudge
        
        const options = {
            time: `+${timestamp}`,
            ...this.history
        }

        const ccs = this.getCCsFromParams(params);

        ccs.forEach(({cc, value}) => {
            const prev = this.history.ccs || {}
            if(prev[cc] === value) return;
            this.history.device.sendControlChange(cc, !prev[value] ? 0 : value, options)
        })

        this.storeHistory(0, ccs);
    }
}
export default Midi;