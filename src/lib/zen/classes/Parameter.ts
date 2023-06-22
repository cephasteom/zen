import type { stack } from '../types'

import { mapToRange, roundToFactor, min, max, clamp } from '../utils/utils'

class Parameter {
    private stack: stack = []

    constructor() {
        // Add all Math functions to the Parameter class
        Object.getOwnPropertyNames( Math ).map( name => {
            this[name] = (...args: number[]) => {
                this.stack = [...this.stack, (x: number) => Math[name](x, ...args)]
                return this
            }
        })
    }

    set(value: number) {
        this.stack = [() => value] 
        return this
    }

    // use params from another stream, e.g. s1.p('foo').use(s0.p.bar).add(2)
    use(parameter: Parameter) {
      this.stack = [...this.stack, ...parameter.stack]
      return this
    }

    // step quantised the output, freq is the number of iterations of the range, either per cycle or per canvas
    // values provided to the callback should be in num of cycles or num of canvas
    range(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => mapToRange((position*freq)%1, 0, 1, lo, hi, step)]
        return this
    }

    // Chained functions
    add(value: number = 0) {
        this.stack = [...this.stack, x => x + value]
        return this
    }

    minus(value: number = 0) {
        this.stack = [...this.stack, x => x - value]
        return this
    }

    mul(value: number = 1) {
        this.stack = [...this.stack, x => x * value]
        return this
    }

    div(value: number = 1) {
        this.stack = [...this.stack, x => x / value]
        return this
    }

    step(value: number) {
        this.stack = [...this.stack, x => roundToFactor(x, value)]
        return this
    }

    clamp(min: number, max: number) {
        this.stack = [...this.stack, x => clamp(x, min, max)]
        return this
    }

    // Get output based on position in cycle or on canvas
    // expected to be normalised between 0 - 1
    get(position: number = 0) {
        return this.stack.length ? this.stack.reduce((val, fn) => fn(val), position) : null
    }

    has() {
        return !!this.stack.length
    }
}

export default Parameter