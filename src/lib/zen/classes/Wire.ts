import { circuit } from './Circuit';
/**
 * Wire
 * Represents a single wire in a quantum circuit
 */
export class Wire {
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
                const params = [(hasParams ? arg1 : [])].flat() || []
                const connections = [(hasControlQubits 
                    ? hasParams ? arg2 : arg1
                    : [])].flat() || []
                const offset = [(hasParams
                    ? hasControlQubits ? arg3 : arg2
                    : hasControlQubits ? arg2 : arg1)].flat()[0] || 0      
                    
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
                    if(params.length === 0) return
                    const options = {
                        params: params
                            .filter((_, i) => i < gate.params.length)
                            .reduce((obj, value, i) => ({
                                ...obj,
                                // TODO: convert value from patternable to number
                                [gate.params[i]]: value
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
    }

    /**
     * Build the gates in the stack
     */
    build() {
        this._stack.forEach((fn) => fn())
    }
}