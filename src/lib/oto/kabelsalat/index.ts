// @ts-ignore
// import { SalatRepl } from '@kabelsalat/web' // from node modules
import { SalatRepl } from '/Users/peterthomas/Documents/personal-development/kabelsalat/packages/web/dist' // from local
import type { Dictionary } from '../types'
import { Gain, Oscillator } from 'tone'
import type { Destination } from 'tone';

export const dummy = new Oscillator({volume: -Infinity, frequency: 0, type: 'sine1'}).start();

class KabelSalat {
    input: Gain
    output: Gain
    repl: SalatRepl
    code: string = ''

    constructor() {
        this.input = new Gain(1);
        this.output = new Gain(1);
        dummy.connect(this.output);
        dummy.connect(this.input);
        
        // @ts-ignore
        this.repl = new SalatRepl({outputNode: this.output._gainNode._nativeAudioNode})
    }

    play(params: Dictionary = {}) {
        const { graph } = params
        if (!this.code || this.code !== graph) {
            this.code = graph
            this.repl.run(this.code)
        }
    }

    cut() {
        // TODO
    }

    release() {
        this.repl.stop()
        this.code = ''
    }
    
    connect(node: typeof Destination | Gain) {
        this.output.connect(node)
    }

    mutate() {
        // TODO
    }
}

export default KabelSalat