import { writable } from 'svelte/store';
import Zen from '$lib/zen/classes/Zen';

export const t = writable(0);
export const c = writable(0);
export const q = writable(16);
export const s = writable(16);

export const z = new Zen();
z.addTCallback(() => t.set(z.time));
z.addTCallback(() => c.set(z.cycle));
z.addTCallback(() => q.set(z.quant));
z.addTCallback(() => s.set(z.size));