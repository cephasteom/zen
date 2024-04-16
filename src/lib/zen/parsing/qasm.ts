import { circuit } from '../classes/Circuit';

const parseGate = (code: string, gate: any, i: number, gates: any[]) => {
    if(!gate) return code
    
    // TODO: handle offset
    const method = gate.connector < 1 ? gate.name : ''
    const params = Object.values(gate.options?.params || {})
    const connections = circuit.gates
        .map((gates: any, stream: number) => gates[i] && gates[i].connector > 0
            ? stream
            : null)
        .filter((v: number | null) => v !== null)
    let args = [connections, params].reduce((args: string, arg: any[], i, array) => {
        return args + (arg.length ? JSON.stringify(arg) + ', ' : '')
    }, '')
    args.endsWith(', ') && (args = args.slice(0, -2))

    return method
        ? code + '.' + method + '(' + args + ')'
        : code
}

export const parseQasm = (code: string) => {
    const startIndex = code.indexOf('"OPENQASM');
    const endIndex = code.indexOf('n"', startIndex) + 2;
    const qasmString = code.substring(startIndex, endIndex)
    if(qasmString.length < 10) return code
    
    circuit.importQASM(
        // remove escaped escapes, as well as first and last quotes
        qasmString.replace(/\\n/g, '\n').replace(/\\"/g, '"').slice(1, -1), 
        (errors: any) => console.log(errors)
    );

    const circuitCode = circuit.gates.reduce((code: string, gates: any, i: number) => {
        const methods = gates.reduce(parseGate, '');
        let result = code
        methods && (result += `s${i}.wire` + methods)
        return result + '\n'
    }, '');

    return code.replace(qasmString, circuitCode)

}

// "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\n"