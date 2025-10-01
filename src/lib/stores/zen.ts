import { writable, get } from 'svelte/store';
import '../oto';

export const editorValue = writable('');
export const loadCode = writable(''); // code loaded from file
export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const editorConsole = writable<{type?: string, message?: string}>({});
export const isPlaying = writable(false);
export const canvas = writable(""); // q5 string for visuals

/* Quantum Circuit State */
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
    {type: 'info', message: 'shift + return to play.'},
    {type: 'info', message: 'esc to stop.\n'},
    {type: 'success', message: 'Commands ->'},
    {type: 'info', message: 'instruments()\nmidi()\nsamples()\nscales()\nchords()\nprint()\nclear()\n'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}`},
];

initialMessages.forEach((message, index) => {
    setTimeout(() => {
        messages.update(arr => [...arr, message]);
    }, (index+1) * 300); // simulate loading
});

export const print = (type: string, message: string) => {
    messages.update(arr => [...arr, {type, message}]);
}

export const clear = () => messages.set([]);

const zenChannel = new BroadcastChannel('zen');
const zmodChannel = new BroadcastChannel('zmod')

// Listen for error messages from Zen
zenChannel.onmessage = ({data: {message, type, data}}) => {
    if(type === 'error' && (get(editorConsole) !== message)) return editorConsole.set({type, message});
    
    ['error', 'info', 'pattern', 'success', 'credit'].includes(type) && print(type, message.toString())
    
    if(type !== 'action') return
    const { t: time, c: cycle, q: quant, delta, gates: gs, measurements: ms, feedback: fb, inputs: ins } = data;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        gates.set(gs);
        measurements.set(ms);
        inputs.set(ins);
    }, delta * 1000);
}

// Listen for errors from ZMod
zmodChannel.onmessage = ({data: {message, type}}) => 
    ['error', 'info', 'pattern', 'success', 'credit'].includes(type) 
    && print(type, message.toString())
