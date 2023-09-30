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
export const messages = writable<string[]>([]);
messages.set(['Welcome to Zen!']);

export const visualsData = writable<Uint8Array>(new Uint8Array(16 * 16 * 4));

const channel = new BroadcastChannel('zen');

// Listen for error messages from Zen
channel.onmessage = ({data: {error: message, action}}) => {
    if(message && (get(error) !== message)) return error.set(message);
    const { t: time, c: cycle, q: quant, s: size, delta, v } = action;
    setTimeout(() => {
        t.set(time);
        c.set(cycle);
        q.set(quant);
        s.set(size);
        get(isDrawing) && visualsData.set(v);
    }, delta * 1000);
}