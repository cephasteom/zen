import { WebMidi, Output } from "webmidi";
import { immediate } from 'tone'
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
    storeHistory(notes: number[], ccs: {}[], device?: Output, channels?: number[] | undefined, latency?: number) {
        const history = this.history || {}
        device && (history.device = device);
        channels && (history.channels = channels);
        notes && (history.notes = [...(history.notes || []), ...notes]);
        ccs && (history.ccs = [...(history.ccs || []), ...ccs]);
        latency && (history.latency = latency);
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

    trigger(params: { [key: string]: number | string } = {}, time: number) {
        const { midi, midichan, latency, n, dur, amp = 0.5 } = params;

        
        // ignore nonexistent devices
        if(!this.outputs.includes(midi.toString())) return;

        const note = n || 60;
        const notes = Array.isArray(note) ? note : [+note];
        const delta = time - immediate()
        const channels = midichan ? (Array.isArray(midichan) ? midichan : [+midichan]) : undefined;
        const device = WebMidi.getOutputByName(midi.toString());
        const timestamp = (delta + (+latency || 0)) * 1000
        
        const options = {
            duration: +dur,
            time: `+${timestamp}`,
            attack: +amp,
            channels, // todo: this may need work if empty [] is not accepted
        }

        // Play notes
        notes.forEach((note, i) => device.playNote(note, {...options, time: `+${timestamp + (i * ((+params.strum) || 0))}`}))

        // get ccs from params
        const ccs = this.getCCsFromParams(params);

        // send ccs
        ccs.forEach(({cc, value}) => {
            const prev = this.history.ccs || {}
            if(prev[cc] === value) return
            
            device.sendControlChange(cc, !prev[value] ? 0 : value, options)
        })

        this.storeHistory(notes, ccs, device, channels, +latency);
    }


    cut(time: number) {
        if(!this.history.device) return;
        
        const latency = this.history.latency || 0;
        
        const delta = time - immediate()
        
        const options = {
            time: `+${((delta + latency) * 1000) - 10}`,
            ...this.history
        }

        this.history.device.sendNoteOff(this.history.notes, options);
        this.history.notes = [];
    }

    mutate(params: params, time: number) {
        if(!this.history.device) return;
        
        const { latency } = params;
        
        const delta = time - immediate()
        const timestamp = ((delta + (+latency || 0)) * 1000) - 10
        
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