import { Pattern } from './Pattern'
import type { Dictionary } from '../types'
import { mod } from '../utils/utils'
import { formatEventParams, formatMutationParams } from '../utils/syntax';

export interface Stream extends Dictionary {
    id: string;
    get: (time: number, q: number, s: number, bpm: number) => void;
    reset: () => void;
}

function makeCallablePattern(pattern: Pattern): Pattern & ((...args: any[]) => any) {
    // @ts-ignore
    const fn = (...args: any[]) => pattern.set(...args); // calls .set()
    
    return new Proxy(fn, {
        get: (_, prop) => (pattern as any)[prop],
        set: (_, prop, value) => Reflect.set(pattern as any, prop, value),
        has: (_, prop) => prop in pattern,
        ownKeys: () => Reflect.ownKeys(pattern),
        getOwnPropertyDescriptor: (_, prop) =>
            Object.getOwnPropertyDescriptor(pattern, prop),
    }) as any;
}

/**
 * A Stream is a musical layer. You can think of it as a track in a DAW, or a channel in a mixer.
 * It can be used to control multiple instruments, effects, and routing.
 */

export class Stream {
    constructor(id: string) {
        const handler = {
            get: (target: Stream, key: string) => {
                if (key in target) return target[key as keyof typeof target];

                // wrap Pattern instance in callable proxy
                const pattern = new Pattern();
                const callable = makeCallablePattern(pattern);
                target[key] = callable;
                return callable;
            }
        };

        const init: Stream = { 
            id,
            set: (params: Dictionary) => {
                Object.entries(params)
                    .filter(([key]) => !['id', 'get', 'reset', 'clear'].includes(key))
                    .forEach(([key, value]) => init[key] = (new Pattern()).set(value));
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