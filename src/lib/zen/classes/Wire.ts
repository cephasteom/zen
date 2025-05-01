import { get } from 'svelte/store';
import { circuit } from './Circuit';
import { handleTypes } from '../utils/handleTypes'; 
import { nStreams } from '../stores';

const channel = new BroadcastChannel('zen')

/**
 * The Wire class represents a single wire in a quantum circuit. They are represented in Zen as q0, q1, q2, etc. 
 * It uses the Quantum Circuit package to implement quantum gates. 
 * Some gates are documented here. See https://www.npmjs.com/package/quantum-circuit#implemented-gates for a list of all implemented gates. 
 * @example q0.h().cx([1])
 */
export class Wire {
    /** @hidden */
    private _t: number = 0;

    /** @hidden */
    private _q: number = 16;

    /** @hidden */
    _id: string;

    /** @hidden */
    row: number;

    /** @hidden */
    private _offset: number = 0;

    /** @hidden */
    private _stack: any[] = []
    
    /** @hidden */
    private _feedback: number = -1

    /** @hidden */
    get feedback() {
        return this._feedback
    }
    
    /** @hidden */
    set feedback(value: number) {
        this._feedback = value
    }

    /** @hidden */
    configureGate(key: string, gate: any, arg1?: number[] | number, arg2?: number[] | number, arg3?: number[] | number)
    {
        this._offset > 0 && this._offset++

        const hasControlQubits = gate.numControlQubits > 0
        const hasParams = gate.params.length > 0

        // determine which argument is which
        // important for live coding so we don't have to pass all arguments
        const connections = [(hasControlQubits ? arg1 : [])].flat().map(i => (i ||0) % get(nStreams)) || []
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
        const id = hasControlQubits
            ? circuit.insertGate(key, column, [this.row, ...controlQubits], { creg })
            : circuit.addGate(key, column, this.row, { creg })
        
        const {wires, col} = circuit.getGatePosById(id)
        
        this._stack.push(() => {
            if(!hasParams) return

            const options = {
                creg,
                params: params.length
                    ? params
                        .filter((_, i) => i < gate.params.length)
                        .reduce((obj, value, i) => ({
                            ...obj,
                            [gate.params[i]]: +handleTypes(
                                value || 0, 
                                this._t, 
                                this._q, 
                                `${this.row}`
                            // theta (0 - PI), phi (0 - 2PI), lambda (0 - 2PI)
                            ) * (i === 0 ? 1 : 2) * Math.PI
                        }), {})
                    : [0,0,0]
            }

            wires.forEach((wire: any) => {
                circuit.gates[wire][col].options = options
            })

        })
        return this
    }
    
    /** @hidden */
    constructor(id: string) {
        this._id = id
        this.row = +id.slice(1)    

        Object.entries(circuit.basicGates).forEach(([key, gate]: [string, any]) => {
            // add a method for each gate
            // variable order of arguments
            // @ts-ignore
            this[key] = (arg1: number[] | number, arg2: number[] | number, arg3: number[] | number) => {
                return this.configureGate(key, gate, arg1, arg2, arg3)
            }
        })

        this.configureGate = this.configureGate.bind(this)
    }

    /**
     * PI rotation over X-axis, also known as NOT gate
     * @param offset - number of columns to skip
     */
    x(offset: number = 0) {
        return this.configureGate('x', circuit.basicGates.x, offset)
    }

    /**
     * PI rotation over Y-axis
     * @param offset - number of columns to skip
     */
    y(offset: number = 0) {
        return this.configureGate('y', circuit.basicGates.y, offset)
    }

    /**
     * PI rotation over Z-axis
     * @param offset - number of columns to skip
     */
    z(offset: number = 0) {
        return this.configureGate('z', circuit.basicGates.z, offset)
    }

    /**
     * Hadamard gate
     * @param offset - number of columns to skip
     */
    h(offset: number = 0) {
        return this.configureGate('h', circuit.basicGates.h, offset)
    }
    
    /**
     * Rotation around the X-axis by given angle
     * @param theta - multiple of PI
     * @param offset - number of columns to skip
     */
    rx(theta: number = 0, offset: number = 0) {
        return this.configureGate('rx', circuit.basicGates.rx, theta, offset)
    }

    /**
     * Rotation around the Y-axis by given angle
     * @param theta - multiple of PI
     * @param offset - number of columns to skip
     */
    ry(theta: number = 0, offset: number = 0) {
        return this.configureGate('ry', circuit.basicGates.ry, theta, offset)
    }

    /**
     * Rotation around the Z-axis by given angle
     * @param phi - multiple of PI
     * @param offset - number of columns to skip
     */
    rz(phi: number = 0, offset: number = 0) {
        return this.configureGate('rz', circuit.basicGates.rz, phi, offset)
    }

    /**
     * Controlled NOT gate, or CNOT gate
     * @param connectedQubits - index or array of indexes
     * @param offset - number of columns to skip
     */
    cx(connectedQubits: number[] = [], offset: number = 0) {
        return this.configureGate('cx', circuit.basicGates.cx, connectedQubits, offset)
    }

    /**
     * Toffoli gate, or CCNOT gate
     * @param connectedQubits - index or array of indexes
     * @param offset - number of columns to skip
     */
    ccx(connectedQubits: number[] = [], offset: number = 0) {
        return this.configureGate('ccx', circuit.basicGates.ccx, connectedQubits, offset)
    }

    /**
     * Single qubit rotation with 3 Euler angles
     * @param angles - [theta, phi, lambda] - multiples of PI
     * @param offset - number of columns to skip
     */
    u3(angles: number[], offset: number = 0) {
        return this.configureGate('u3', circuit.basicGates.u3, angles, offset)
    }

    /**
     * Use the last measure as the initial state of the qubit
     * @param stream - index of the stream to use
     */
    fb(stream: number = this.row) {
        this._stack.push(() => {
            this.feedback = +handleTypes(
                stream, 
                this._t, 
                this._q, 
                `${this.row}`
            )
        })
        return this
    }

    /**
     * Generate a random circuit
     * @param numQubits - number of qubits
     * @param numGates - number of gates
     */
    random(numQubits: number = 4, numGates: number = 8) {
        circuit.randomCircuit(numQubits, numGates)
        return this
    }

    /**
     * import a circuit from QASM code
     */
    import(code: string) {
        circuit.importQASM(code, function(errors: any) {
            errors.length && console.error(errors)
        })
        return this
    }

    /**
     * Update a gate parameter outside of a gate method
     * @param param - id of the parameter to update. Should be 'gateName.gateIndex.paramIndex' as in 'rx.0.0'
     * @param value - value to set. Can be a number of an instance of a pattern
     * @example q0.update('r2.2.0', $noise())
     */ 
    update(param: string, value: number) {
        const [name, gateIndex, paramIndex] = param.split('.')
        const gates = circuit.gates[this.row] || []
        const gate = gates.filter((gate: any) => gate.name === name)[+gateIndex]
        if (!gate) return channel.postMessage({ type: 'error', message: `Can't find gate ${name}.${gateIndex}` })
        
        this._stack.push(() => {
            // get gate by id
            // work out what it's parameter value is using handleType
            // update the gate
            // update messages should always be at the end of the stack
        })
        return this
    }

    /** @hidden */
    clear() {
        this._stack = []
        this._offset = 0
        this.feedback = -1
    }

    /**
     * Build the gates in the stack
     * @hidden
     */
    build(t: number, q: number) {
        this._t = t
        this._q = q
        
        this._stack.forEach((fn) => fn())
    }
}