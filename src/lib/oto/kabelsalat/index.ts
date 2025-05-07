// @ts-ignore
import { SalatRepl } from '@kabelsalat/web'
import type { Dictionary } from '../types'

class KabelSalat {
    repl: SalatRepl
    code: string = ''

    constructor() {
        this.repl = new SalatRepl()
        console.log(this.repl)
    }

    parse(graph: string) {
        // remove .out() at end of graph and replace with an envelope and out
        // TODO: 
        // return graph.replace(/\.out\(\)/g, '.mul(impulse(16).perc(.01).adsr(.02,.1,.5,.01)).out()')
        return graph
    }

    play(params: Dictionary = {}) {
        const { graph } = params
        if (!this.code || this.code !== graph) {
            this.code = this.parse(graph)
            this.repl.run(this.code)
        }

        
    }

    cut() {
        this.repl.stop()
        this.code = ''
    }

    release() {
        this.repl.stop()
        this.code = ''
    }
    
    connect(node: AudioNode) {
        // TODO
    }

    mutate() {
        // TODO
    }
}

export default KabelSalat