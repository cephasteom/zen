import { writable, get, derived } from 'svelte/store';
import '../oto';
import type { vector } from '../zen/types'

export const editorValue = writable('');
export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const editorConsole = writable<{type?: string, message?: string}>({});
export const isPlaying = writable(false);

export const gates = writable<any[]>([[],[],[],[], [],[],[],[]]); // circuit gates
export const measurements = writable<any[]>([0,0,0,0,0,0,0,0]); // circuit measurements
export const inputs = writable<number[]>([0,0,0,0,0,0,0,0]); // initial state of qubits in circuit

export const showCircuit = writable(false)
export const toggleCircuit = () => showCircuit.update(s => {
    const show = !s;
    localStorage.setItem('z.circuit', show ? 'true' : '');
    return show;
})
function initCircuit() {
    if(typeof localStorage === 'undefined') return
    const show = localStorage.getItem('z.circuit');
    if(show) showCircuit.set(true);
}

initCircuit();

export const messages = writable<{type: string, message: string}[]>([]);

const initialMessages = [
    {type: 'success', message: 'Welcome to Zen!'},
    {type: 'info', message: 'shift + enter to play.'},
    {type: 'info', message: 'esc to stop.\n'},
    {type: 'success', message: 'Commands ->'},
    {type: 'info', message: 'instruments()\nmidi()\nsamples()\nscales()\nchords()\nprint()\nclear()\n'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}\n`},
];

initialMessages.forEach((message, index) => {
    setTimeout(() => {
        messages.update(arr => [...arr, message]);
    }, (index+1) * 300); // simulate loading
});

export const print = (type: string, message: string) => {
    // if last message does not match, add to messages
    const last = get(messages).slice(-1)[0];
    if(last && last.message === message) return
    type === 'pattern' && messages.update(arr => arr.filter(m => m.type !== 'pattern'))
    messages.update(arr => [...arr, {type, message}]);
}

export const clear = () => messages.set([]);

const visualsTypes = writable<string[]>(['grid', 'sphere', 'none']);
export const visualsData = writable<vector[]>([]);
export const gridData = writable<number[] | number[][]>([]);
gridData.subscribe(d => {
    if(d && d.length) {
        get(visualsType) === 'sphere' && visualsType.set('grid')
        visualsTypes.set(['grid', 'none'])
    } 
    else {
        visualsTypes.set(['grid', 'sphere', 'none'])
    }
})

export const visualsType = writable<'sphere' | 'grid' | 'none'>('grid')
export const toggleVisuals = () => {
    const types = get(visualsTypes)
    const currentType = get(visualsType)
    const i = types.indexOf(currentType);
    const type = types[(i + 1) % types.length];
    localStorage.setItem('z.visuals', type);
    // @ts-ignore
    visualsType.set(type);
}
export const showVisuals = derived(visualsType, $visualsType => $visualsType !== 'none');

function initVisuals() {
    if(typeof localStorage === 'undefined') return
    const type = localStorage.getItem('z.visuals');
    if(type) visualsType.set(type as any);
}

initVisuals();

const zenChannel = new BroadcastChannel('zen');

// Listen for error messages from Zen
zenChannel.onmessage = ({data: {message, type, data}}) => {
    if(type === 'error' && (get(editorConsole) !== message)) return editorConsole.set({type, message});
    
    ['error', 'info', 'pattern', 'success', 'credit'].includes(type) && print(type, message.toString())
    
    if(type !== 'action') return
    const { t: time, c: cycle, q: quant, s: size, delta, v, grid, gates: gs, measurements: ms, feedback: fb, inputs: ins } = data;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        s.set(size);
        gates.set(gs);
        measurements.set(ms);
        inputs.set(ins);
        visualsData.set(v);
        gridData.set(grid);
    }, delta * 1000);
}