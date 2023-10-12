import { writable, get } from 'svelte/store';
import '../oto';

export const editorValue = writable('');
export const t = writable(0); // time
export const c = writable(0); // cycle
export const q = writable(16); // quantization (frames per cycle)
export const s = writable(16); // size of canvas
export const error = writable('');
export const isPlaying = writable(false);

export const isDrawing = writable(false);
export const messages = writable<{type: string, message: string}[]>([
    {type: 'success', message: 'Welcome to Zen!'},
    {type: 'info', message: 'shift + enter to play.'},
    {type: 'info', message: 'esc to stop.'},
    {type: 'info', message: 'Instruments ->\n 0: synth\n 1: sampler\n 2: granular\n 3: additive\n 4: acid\n 5: drone\n 6: sub'},

]);

export const print = (type: string, message: string) => {
    // if last message does not match, add to messages
    const last = get(messages).slice(-1)[0];
    if(last && last.message === message) return
    type === 'pattern' && messages.update(arr => arr.filter(m => m.type !== 'pattern'))
    messages.update(arr => [...arr, {type, message}])
    type === 'error' && (get(isDrawing) || window.innerWidth < 600) && error.set(message)
}

export const clear = () => messages.set([]);

export const visualsData = writable<Uint8Array>(new Uint8Array(16 * 16 * 4));

const zenChannel = new BroadcastChannel('zen');
const otoChannel = new BroadcastChannel('oto')

// Listen for error messages from Zen
zenChannel.onmessage = ({data: {message, type, data}}) => {
    if(type === 'error' && (get(error) !== message)) return error.set(message);
    
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