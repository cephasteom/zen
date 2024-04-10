import type { Pattern } from './Pattern';
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
    private theta: Pattern | null = null;
    private phi: Pattern | null = null;
    private lambda: Pattern | null = null;
    row: number;
    private _offset: number = 0;
    private _stack: any[] = []
    
    constructor(row: number) {
        this.row = row;    
        // TODO: patternable params
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
                
                // intialise the gate without options
                hasControlQubits
                    ? circuit.insertGate(key, column, [this.row, ...controlQubits])
                    : circuit.addGate(key, column, this.row)
                
                // add a function to the stack to set params dynamically on each frame
                this._stack.push(() => {
                    if(!hasParams) return

                    // TODO: scale phi to 0-2pi
                    const options = {
                        params: params.length
                            ? params
                                .filter((_, i) => i < gate.params.length)
                                .reduce((obj, value, i) => ({
                                    ...obj,
                                    [gate.params[i]]: +handleTypes(value, this._t, this._q, `${this.row}`) * Math.PI
                                }), {})
                            : gate.params.reduce((obj: {}, key: string) => ({
                                ...obj, 
                                // use theta, phi, lambda if they are defined
                                // @ts-ignore
                                [key]: +handleTypes(this[key] || 0, this._t, this._q, `${this.row}`) * Math.PI
                            }), {})
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

    clear() {
        this._stack = []
        this._offset = 0
        this.theta = null
        this.phi = null
        this.lambda = null
    }

    /**
     * Build the gates in the stack
     */
    build(t: number, q: number, s: number, theta: Pattern, phi: Pattern, lambda: Pattern) {
        this._t = t
        this._q = q
        this._s = s
        this.theta = theta
        this.phi = phi
        this.lambda = lambda
        this._stack.forEach((fn) => fn())
    }
}