import { Pattern } from './Pattern'
import type { Dictionary } from '../types'
import { e } from 'mathjs';

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
            get: (time: number, q: number, s: number, bpm: number) => {
                const t = +(init.t && init.t.has() ? init.t.get(time, q) || 0 : time);

                const params = Object.entries(init)
                    .filter(([key]) => !['id','get', 't', 'reset'].includes(key))
                    .reduce((acc, [key, pattern]) => ({
                        ...acc,
                        // TODO: x, y, z expect s, rather than q
                        [key]: pattern.get(t, q, bpm)
                    }), {} as Dictionary);
                console.log(params)

            },
            reset: () => {
                Object.entries(init)
                    .filter(([key]) => !['id','get','reset'].includes(key))
                    .map(([key, pattern]) => pattern.reset());
            }
        };

        return new Proxy(init, handler);
    }
}