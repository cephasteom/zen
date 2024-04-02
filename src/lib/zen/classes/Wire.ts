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

        // TODO: patternable params
        // TODO: improve syntax so that you have to pass as little as possible to each method
        // TODO: increasing the order should affect all that follow
        Object.entries(circuit.basicGates).forEach(([key, gate]: [string, any]) => {
            // add a method for each gate
            // @ts-ignore
            this[key] = (params: patternable[] = [], connections: [] | number = [], order: number | null = null) => {
                // format connections so that it is an appropriate list of control qubits
                const controlQubits =  [connections].flat()
                    .filter((qubit, i) => qubit !== this.row)
                    .filter((_, i) => i < gate.numControlQubits)
                
                // use the order if it is provided, otherwise use the length of the stack
                const column = order || this._stack.length
                
                // intialise the gate
                circuit.addGate(key, column, [this.row, ...controlQubits])
                
                const options = params.filter((_, i) => i < gate.params.length)

                // if there are options, add a function to the stack to set them dynamically on each frame
                this._stack.push(() => {
                    if(options.length === 0) return

                    // create an object of options from the params
                    circuit.gates[this.row][column].options = options
                        .reduce((obj, value, i) => ({
                            ...obj,
                            // TODO: convert value from patternable to number
                            [gate.params[i]]: value
                        }), {})
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
        this._stack.forEach((fn) => fn())
        console.log(circuit)
    }
}