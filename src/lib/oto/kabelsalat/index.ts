// @ts-ignore
import { SalatRepl } from '@kabelsalat/web'
import type { Dictionary } from '../types'

class KabelSalat {
    repl: SalatRepl
    code: string = ''

    constructor() {
        this.repl = new SalatRepl()
    }

    parse(graph: string) {
        // remove .out() at end of graph and replace with an envelope and out
        // TODO: 
        return graph.replace(/\.out\(\)/g, '.mul(impulse(16).perc(.01).adsr(.02,.1,.5,.01)).out()')
    }

    play(params: Dictionary = {}) {
        if (this.code) return
        const { graph } = params
        this.code = this.parse(graph)
        this.repl.run(this.code)

        // TODO: trigger an event
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
}

export default KabelSalat