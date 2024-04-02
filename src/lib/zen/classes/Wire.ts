import { circuit } from './Circuit';
import type { patternable } from '../types'
/**
 * Wire
 * Represents a single wire in a quantum circuit
 */

export class Wire {
    row: number;
    private _stack: any[] = []
    
    constructor(row: number) {
        this.row = row;        

        Object.entries(circuit.basicGates).forEach(([key, gate]: [string, any]) => {
            // add a method for each gate
            // @ts-ignore
            this[key] = (column: number | null = null, params: patternable[] = []) => {
                // when called, push a function to the stack
                // i is its position in the stack
                this._stack.push((i: number) => {
                    // create an object of options from the params
                    const options = params
                        .filter((_, i) => i < gate.params.length)
                        .reduce((obj, value, i) => ({
                            ...obj,
                            // TODO: convert value from patternable to number
                            [gate.params[i]]: value
                        }), {})
                    
                    // add the gate to the circuit
                    // use the column if provided, otherwise use its position in the stack
                    circuit.addGate(key, column || i, this.row, options)
                })
                return this
            }
        })
    }

    clear() {
        this._stack = []
    }

    /**
     * Build the gates in the stack
     */
    build() {
        this._stack.forEach((fn, i) => fn(i))
        console.log(circuit)
    }
}