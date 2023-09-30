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
export const messages = writable<{type: string, message: string}[]>([{type: 'success', message: 'Welcome to Zen!'}]);

export const print = (type: string, message: string) => {
    // if last message does not match, add to messages
    const last = get(messages).slice(-1)[0];
    if(last && last.message === message) return
    messages.update(arr => [...arr, {type, message}])
    type === 'error' && get(isDrawing) && error.set(message)
}

export const clear = () => messages.set([]);

export const visualsData = writable<Uint8Array>(new Uint8Array(16 * 16 * 4));

const zenChannel = new BroadcastChannel('zen');
const otoChannel = new BroadcastChannel('oto')

// Listen for error messages from Zen
zenChannel.onmessage = ({data: {error: message, action}}) => {
    if(message && (get(error) !== message)) return error.set(message);
    if(!action) return
    const { t: time, c: cycle, q: quant, s: size, delta, v } = action;
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