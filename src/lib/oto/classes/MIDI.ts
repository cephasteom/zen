import { WebMidi, Output } from "webmidi";
import { mapToStepRange } from '../utils/utils'
import type { params } from '../types'

class Midi {
    history: any = {}
    inputs: string[] = []
    outputs: string[] = []
    
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

    getCCsFromParams(params: { [key: string]: number | string } = {}): {}[] {
        return Object.keys(params).reduce((arr: {}[], key: string) => {
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
        const { midi, midichan, mididelay, n, dur = 1, amp = 0.5 } = params;

        // ignore nonexistent devices
        if(!this.outputs.includes(midi.toString())) return;

        const note = n || 60;
        const channels = midichan ? (Array.isArray(midichan) ? midichan : [+midichan]) : undefined;
        const device = WebMidi.getOutputByName(midi.toString());
        const duration = +dur * 1000;
        const timestamp = (delta * 1000) + (+mididelay || 0)

        const options = {
            duration,
            time: `+${timestamp}`,
            attack: +amp,
            channels,
        }

        // Play note
        device.playNote(note, {...options, time: `+${timestamp}`});

        // get ccs from params
        const ccs = this.getCCsFromParams(params);

        // send ccs
        ccs.forEach(({cc, value}) => {
            const prev = this.history.ccs || {}
            if(prev[cc] === value) return
            
            device.sendControlChange(cc, !prev[value] ? 0 : value, options)
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
        
        const { mididelay } = params;
        
        const timestamp = (delta * 1000) + (+mididelay || 0) - 10
        
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

        this.storeHistory([], ccs);
    }
}
export default Midi;