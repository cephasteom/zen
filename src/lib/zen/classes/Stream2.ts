import { Pattern } from './Pattern'
import type { Dictionary } from '../types'
import { mod } from '../utils/utils'
import { formatEventParams, formatMutationParams } from '../utils/syntax';

export interface Stream extends Dictionary {
    id: string;
    get: (time: number, q: number, s: number, bpm: number) => void;
    reset: () => void;
}

function isTrigger(key: string): boolean {
    return ['e', 'm', 'solo', 'mute'].includes(key);
}

/**
 * A Stream is a musical layer. You can think of it as a track in a DAW, or a channel in a mixer.
 * It can be used to control multiple instruments, effects, and routing.
 * Streams are available within Zen as `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7`.
 * @example
 * s0.set({inst:0,cut:0,reverb:.5,delay:.25,vol:.5,modi:1.25,mods:0.1})
 * s0.n.set('Cpro%16..*16 | Cpro%16..?*16').sub(12),
 * s0.s.noise(0.05,0.5,0.25)
 * s0.e.every(4).or(every(3))
 */
export class Stream {
    constructor(id: string) {
        const handler = {
            get: (target: Stream, key: string) => {
                if (key in target) return target[key as keyof typeof target];

                // wrap Pattern instance in callable proxy
                const pattern = new Pattern(isTrigger(key));
                
                target[key] = pattern;
                return pattern;
            }
        };

        const init: Stream = { 
            id,
            set: (params: Dictionary) => {
                Object.entries(params)
                    .filter(([key]) => !['id', 'get', 'reset', 'clear'].includes(key))
                    .forEach(([key, value]) => init[key] = (new Pattern(isTrigger(key))).set(value));
            },
            get: (time: number, q: number, s: number, bpm: number) => {
                const t = +(init.t && init.t.has() ? init.t.get(time, q) || 0 : time);

                const params = Object.entries(init)
                    .filter(([key]) => !['id', 'set', 'get', 't', 'reset', 'clear'].includes(key))
                    .reduce((acc, [key, pattern]) => ({
                        ...acc,
                        [key]: pattern.get(t, ['x', 'y', 'z'].includes(key) ? s : q, bpm)
                    }), {} as Dictionary);

                const mute = !!params.mute
                const solo = !!params.solo
                const e = !mute && !!params.e
                const m = !mute && !!params.m
                const lag = (60000/bpm)/q // ms per division

                // compile all parameters
                const compiled = (e || m) ? {
                    track: +id.slice(1),
                    _track: +id.slice(1),
                    ...Object.entries(params)
                        .filter(([key]) => !['e', 'm', 'mute', 'solo'].includes(key))
                        .reduce((acc, [key, value]) => ({
                            ...acc,
                            [key]: value
                        }), {}),
                    bpm, // bpm
                    q, // divisions
                } : {}
                    
                // return the stream's parameters
                return {
                    id,
                    t, q, s, bpm,
                    e, m, solo, mute,
                    x: mod(params.x || 0, s),
                    y: mod(params.y || 0, s),
                    z: mod(params.z || 0, s),
                    eparams: formatEventParams(compiled, {}), 
                    mparams: formatMutationParams(compiled, {}, lag) 
                }
            },
            clear: () => {
                Object.keys(init)
                    .filter(key => !['id','set','get','reset','clear'].includes(key))
                    .map(key => delete init[key]);
            },
            reset: () => {
                Object.entries(init)
                    .filter(([key]) => !['id','set','get','reset','clear'].includes(key))
                    .map(([_, pattern]) => pattern.reset());
            }
        };

        return new Proxy(init, handler);
    }
}