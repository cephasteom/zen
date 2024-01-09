import { writable, get } from 'svelte/store';
import '../oto';

export const editorValue = writable('');
export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const editorConsole = writable<{type?: string, message?: string}>({});
export const isPlaying = writable(false);

export const isDrawing = writable(false);
export const messages = writable<{type: string, message: string}[]>([
    {type: 'success', message: 'Welcome to Zen!'},
    {type: 'info', message: 'shift + enter to play.'},
    {type: 'info', message: 'esc to stop.\n'},
    {type: 'success', message: 'Instruments ->'},
    {type: 'info', message: '0: synth\n1: sampler\n2: granular\n3: additive\n4: acid\n5: drone\n6: sub\n'},

]);

export const print = (type: string, message: string) => {
    // if last message does not match, add to messages
    const last = get(messages).slice(-1)[0];
    if(last && last.message === message) return
    type === 'pattern' && messages.update(arr => arr.filter(m => m.type !== 'pattern'))
    messages.update(arr => [...arr, {type, message}]);
    (get(isDrawing) || window.innerWidth < 600) && editorConsole.set({type, message})
}

export const clear = () => messages.set([]);

export const visualsData = writable<Uint8Array>(new Uint8Array(16 * 16 * 4));

const zenChannel = new BroadcastChannel('zen');
const otoChannel = new BroadcastChannel('oto')

// Listen for error messages from Zen
zenChannel.onmessage = ({data: {message, type, data}}) => {
    if(type === 'error' && (get(editorConsole) !== message)) return editorConsole.set({type, message});
    
    ['error', 'info', 'pattern', 'success'].includes(type) && print(type, message.toString())
    
    if(type !== 'action') return
    const { t: time, c: cycle, q: quant, s: size, delta, v } = data;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        s.set(size);
        get(isDrawing) && visualsData.set(v);
    }, delta * 1000);
}

otoChannel.onmessage = ({data: {type, message}}) => {
    print(type, message)
}