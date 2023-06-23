import type { stack } from '../types'
import { mapToRange, roundToFactor, clamp, noise } from '../utils/utils'

class Parameter {
    private stack: stack = []

    constructor(value: number | null = null) {
        value !== null && this.set(value);
        
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

    seq(values: number[] = [], freq: number = 1) {
        this.stack = [(position: number) => values[Math.floor((position*freq*values.length)%values.length)]]
        return this
    }

    // sine function
    sine(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const radians = ((position*freq)%1) * 360 * (Math.PI/180)
            const sin = Math.sin(radians)

            return mapToRange(sin, -1, 1, lo, hi, step)
        }]
        return this
    }

    // cosine function
    cosine(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const radians = ((position*freq)%1) * 360 * (Math.PI/180)
            const cos = Math.cos(radians)

            return mapToRange(cos, -1, 1, lo, hi, step)
        }]
        return this
    }

    // sawtooth function
    saw(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const saw = ((position*freq)%1)

            return mapToRange(saw, 0, 1, lo, hi, step)
        }]
        return this
    }

    // triangle function
    tri(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const tri = Math.abs(((position*freq)%1) - 0.5) * 2

            return mapToRange(tri, 0, 1, lo, hi, step)
        }]
        return this
    }

    // square function
    square(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const square = ((position*freq)%1) < 0.5 ? 0 : 1

            return mapToRange(square, 0, 1, lo, hi, step)
        }]
        return this
    }

    // random function
    random(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            const random = Math.random()

            return mapToRange(random, 0, 1, lo, hi, step)
        }]
        return this
    }

    // noise function
    noise(lo: number = 0, hi: number = 1, freq: number = 1, step: number = 0) {
        this.stack = [(position: number) => {
            return mapToRange(noise.simplex2(position*freq,0), -1, 1, lo, hi, step)
        }]
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
        return this.stack.length ? this.stack.reduce((val, fn) => fn(val), position) : 0
    }

    has() : boolean {
        return !!this.stack.length
    }
}

export default Parameter

// const p  = new Parameter()
// console.log(
//     p.seq([0,2,4,6]).get(1)
// )