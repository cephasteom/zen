import { circuit } from './Circuit';
import { handleTypes } from '../utils/handleTypes'; 
/**
 * Wire
 * Represents a single wire in a quantum circuit
 */
export class Wire {
    private _t: number = 0;
    private _q: number = 16;
    private _s: number = 16;
    row: number;
    private _offset: number = 0;
    private _stack: any[] = []

    private _feedback: number = -1
    get feedback() {
        return this._feedback
    }

    set feedback(value: number) {
        this._feedback = value
    }
    
    constructor(row: number) {
        this.row = row;    

        Object.entries(circuit.basicGates).forEach(([key, gate]: [string, any]) => {
            // add a method for each gate
            // variable order of arguments
            // @ts-ignore
            this[key] = (arg1: number[] | number, arg2: number[] | number, arg3: number[] | number) => {
                this._offset > 0 && this._offset++

                const hasControlQubits = gate.numControlQubits > 0
                const hasParams = gate.params.length > 0

                // determine which argument is which
                // important for live coding so we don't have to pass all arguments
                const connections = [(hasControlQubits ? arg1 : [])].flat().map(i => i % 8) || []
                const params = [(hasParams 
                    ? hasControlQubits ? arg2 : arg1
                    : [])].flat().filter(v => v!== undefined && v !== null)

                const offset = [(hasControlQubits
                    ? hasParams ? arg3 : arg2
                    : hasParams ? arg2 : arg1)].flat()[0] || 0  
                    
                this._offset += offset

                // format connections so that they are appropriate list of control qubits
                const controlQubits =  connections
                    .filter(qubit => qubit !== this.row)
                    .filter((_, i) => i < gate.numControlQubits)
                
                const gates = circuit.gates[this.row] || [];
                const firstNullIndex = gates.findIndex((gate: any) => gate === null);
                const column = firstNullIndex !== -1 ? firstNullIndex + this._offset : gates.length + this._offset;
                const creg = key === 'measure' ? {
                    name: "c",
                    bit: this.row
                } : {}
                
                // intialise the gate without options
                hasControlQubits
                    ? circuit.insertGate(key, column, [this.row, ...controlQubits], { creg })
                    : circuit.addGate(key, column, this.row, { creg })
                
                // add a function to the stack to set params dynamically on each frame
                this._stack.push(() => {
                    if(!hasParams) return

                    const options = {
                        creg,
                        params: params.length
                            ? params
                                .filter((_, i) => i < gate.params.length)
                                .reduce((obj, value, i) => ({
                                    ...obj,
                                    [gate.params[i]]: +handleTypes(value, this._t, this._q, `${this.row}`) * Math.PI 
                                }), {})
                            : [0,0,0]
                    }

                    // overwrite the gate with options
                    hasControlQubits
                        ? circuit.insertGate(key, column, [this.row, ...controlQubits], options)
                        : circuit.addGate(key, column, [this.row], options)
                })
                return this
            }
        })
    }

    /**
     * Use the last measure as the initial state of the qubit
     */
    fb(stream: number = this.row) {
        this._stack.push(() => {
            this.feedback = +handleTypes(stream, this._t, this._q, `${this.row}`)
        })
        return this
    }

    clear() {
        this._stack = []
        this._offset = 0
        this.feedback = -1
    }

    /**
     * Build the gates in the stack
     */
    build(t: number, q: number, s: number) {
        this._t = t
        this._q = q
        this._s = s
        
        this._stack.forEach((fn) => fn())
    }
}