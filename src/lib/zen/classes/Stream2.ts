import { Pattern } from './Pattern'
import type { Dictionary } from '../types'

/**
 * A Stream is a musical layer. You can think of it as a track in a DAW, or a channel in a mixer.
 * It can be used to control multiple instruments, effects, and routing.
 */

export class Stream {

    /** @hidden */
    constructor(id: string) {

        // catch all calls to this.p, this.px, this.py, this.pz and return a new Pattern if the key doesn't exist
        const handler = {
            get: (target: Dictionary, key: string) => key in target 
                ? target[key as keyof typeof target] 
                : (target[key] = new Pattern())
        }

        // set this object to be a Proxy that uses the handler
        return new Proxy({}, handler);
    }
}