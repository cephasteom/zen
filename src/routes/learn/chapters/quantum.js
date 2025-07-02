export default `# Zen Quantum
Zen is a quantum computer music programming language. It contains an integration of the [Quantum Circuit library](https://www.npmjs.com/package/quantum-circuit) developed by Quantastica to facilitate the design and execution of (simulated) quantum circuits, from the comfort of your web browser. 

Switch on the circuit view by clicking the burger menu in the bottom right of the screen. Circuits are built by chaining gates to virtual wires. Each wire represents a qubit, the fundamental unit of quantum information. In Zen, qubits are represented by a "q", and an integer, as in \`q0\`, \`q1\`, \`q2\`, etc. Gates are added by chaining methods to each qubit.
\`\`\`js
q0.h().cx(1).cx(1,4).h()
q1.cx(2,2).cx(2,3)
q2.cx(3,3).cx(3,2)
q3.cx(4,4).cx(4,1)
q4.cx(5,5)
\`\`\`

Gate parameters can be passed as raw values, [mini-notation](/learn/mini-notation), or [Patterns](/learn/patterns).
\`\`\`js
q0.rx('1?0*16')
q1.rx(saw().step(0.25))
\`\`\`

The outcomes of circuit executions, encompassing the state vector, individual qubit measurements, basis states, probabilities, and amplitude coefficients, can serve as data to be sonified within your Zen code. In the remainder of this section, we explain how to construct quantum circuits within Zen, and how to access the available quantum data within your compositions. For a more detailed explanation of quantum computer music, see [Miranda (2022)](https://link.springer.com/book/10.1007/978-3-031-13909-3).

Run the following example to get a feel for quantum programming in Zen:
\`\`\`js
q0.h().cx([1]).ccx([1,2])
q1.fb(0)
q2.fb(1)

s0.e.qm(0, 32)
s1.e.qm(1, 32)
s2.e.qm(2, 32)

s0.set({inst: 1, bank: 'bd808', i: 3, cut: 0})
s1.set({inst: 1, bank: 'sd808', i: '0..1?*16', cut: [0,1]})
s2.set({inst: 1, bank: 'hh', i: '0..16?*16', cut: [0,2], vol: 0.5})
\`\`\`

## Gates
All of the gates implemented in Zen can be found in the [Quantum Circuit library](https://www.npmjs.com/package/quantum-circuit) and, in each case, use the short name as the name of the method.

## Multi-qubit gates
Multi-qubit gates are used to entangle qubits. They connect one or more control qubits to a target qubit. A gate will be applied to the target qubit only if the state(s) of the control qubit(s) meet certain conditions. In Zen, the wire that the gate is appended to is always the control qubit. Additional qubits are passed as the first argument as an index or array of indexes. For example, to apply a CNOT, or CX, gate to qubits 0 and 1:
\`\`\`js
q0.cx(1)
\`\`\`
Here, the control qubit is 0 and the target qubit is 1. Qubit 1 has an X gate applied only if qubit 0 is in the state |1⟩.

To apply a CCNOT, or CCX, gate to qubits 0, 1 and 2:
\`\`\`js
q0.ccx([1,2])
\`\`\`
Here, the control qubits are 0 and 1, and the target qubit is 2. Qubit 2 has an X gate applied only if qubit 0 and qubit 1 are in the state |1⟩.

### Gate parameters
Some gates require additional parameters. For example, the U3 gate expects theta, phi, and lambda angles passed as an array. For example, to apply a U3 gate to qubit 0:
\`\`\`js
q0.u3([0.1,0.2,0.3])
\`\`\`
Parameters are always normalised (between 0 and 1). In the case of the theta angle, this translates to π. For phi and lambda, 2π. Values can be numbers, [mini-notation](/learn/mini-notation), or [Patterns](/learn/patterns). The following will work:
\`\`\`js
s0.x.sine()
q0.u3([0.5,'0.25?0.5?0.75?1*16',s0.x])
\`\`\`
You can use pass stream axes as parameters to a gate. For example:
\`\`\`js
s0.x.sine()
s0.y.saw()
s0.z.noise()
q0.u3([s0.y,s0.x,s0.z])
\`\`\`
This will apply a U3 gate to qubit 0 with the parameters set by the patterns \`.x\`, \`.y\`, and \`.z\` of stream 0. Or, you can use any custom pattern defined in the usual way. For example:
\`\`\`js
q0.u3([sine(),saw(),noise()])
\`\`\`

### Gate position
By default, adding gates places them sequentially on the wire. You may need to offset the position and move the gate further along the wire. 
\`\`\`js
q0.cx(1)
q1.cx(2)
q2.cx(3,2)
q3.cx(4,3)
\`\`\`

### Arguments
We therefore have three potential arguments for each gate: the connected qubit(s), the parameters, and the position. Some gates require all three, some only require one or two. This being a live coding environment, we want to write as little code as possible. As a rule, arguments are ordered as follows: connected qubit(s), parameters, position. If a gate does not expect connected qubits, or parameters, these can be omitted. For example:
\`\`\`js
q0.x(2) // no target qubit or parameters, so arguments are just [position]
q0.u3([0.1,0.2,0.3],2) // no target qubits but parameters can be specified, so arguments are [parameters, position]
q0.ccx([1,2],2) // target qubits and position can be specified, so arguments are [target qubits, position]
q0.xx(2,0.5,0) // a rare example of a gate that requires all three arguments [target qubits, parameters, position]
\`\`\`
See the [Wire class documentation](/docs/classes#wire) for a list of the main gates and their parameters. See the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates) for a full list of gates and their parameters.

### Feedback
Use the \`.fb()\` method to apply feedback to a wire. This will use the previous measurement as the initial state of the qubit before the circuit runs. For example:
\`\`\`js
q0.x().fb()
\`\`\`
By default, prior results are taken from the same qubit. However, you can specify a different qubit as the input for feedback by passing it as an argument. For example:
\`\`\`js
z.bpm.set(20)
q0.h()
q1.fb(0) // uses the previous measurement of stream 0 as the initial state
\`\`\`

## Sonifying Data
There are a number of Pattern methods that can fetch and manipulate the results of running a quantum circuit. These can be used as data to be sonified. All methods associated with Zen's quantum mode are prefixed with a \`q\`.

### Measurement
\`qmeasurement()\`, alias \`qm()\`, returns the collapsed state of a qubit: either a |0⟩ or |1⟩. This is useful for triggering events. The first argument is the index of the qubit you wish to measure. For example:
\`\`\`js
s0.set({inst:0,reverb:0.125,rtail:0.2,cut:0,cutr:250,dur:100,mods:0.1})

q0.u3([s0.y,s0.x,0])

s0.y.noise()
s0.x.sine(0,1,1/3)

s0._n.set(s0.y).mtr(0,16).set('Cpro%16..*16 | Cpro%16..?*16').sub('0?12*16')
s0._modi.set(s0.x).mtr(1,10)
s0.e.qmeasurement(0) // measure qubit 0. If it collapses to |1⟩, trigger the event
s0.m.not(s0.e)
\`\`\`

### Measurements
Use \`qmeasurements()\`, alias \`qms\`, to get the measurements of all qubits as an array.
\`\`\`js
s0.e.qmeasurements().at(0) // this is the same...
s0.e.qmeasurement(0) // ...as this
\`\`\`

You can pass an integer greater than 1 as the first argument to loop the measurements, and an integer as the second argument to set the number of times this loop should repeat before regenerating with new measurements.

### Probability
Use the \`qprobability()\`, or alias \`qpb\`, method to get the probability (squared amplitude coefficient) of a given basis state. The number of states in a quantum system is 2 to the power of the number of qubits. In a system with 2 qubits, there are 4 possible basis states (|00⟩, |01⟩, |10⟩, |11⟩). To get the probability for state |01⟩, for example, pass in the integer 1:
\`\`\`js
q0.rx(0.25)
q1.rx(0.75)

s0.amp.qpb(1).print() // print the probability of the state |01⟩ to the console
s0.e.every(4)
\`\`\`

Using the probability as the input for a gate creates interesting feedback loops. For example:
\`\`\`js
s1.y.qpb(0)

q0.h().cx([1]).ccx([1,2])
q1.fb(0).rx(s1.y);

[s0,s1,s2].map((s,i) => s.e.qmeasurement(i,32))
\`\`\`
Each probability is returned as a float to 5 decimal places.

### Probabilities
Use the \`qprobabilities()\`, or alias \`qamps\`, method to get an array of the probabilities for each possible result of a circuit. For example:
\`\`\`js
s0.wire.rx(0.25)
s1.wire.rx(0.75)

s0.amp.pbs().print() // print all probabilities to the console
s0.e.every(4)
\`\`\`

Using the grid can be useful for seeing what is happening here, especially when you start to use dynamic parameters:
\`\`\`js
z.grid.set(qpbs().fn(a=>[a]))

q0.rx(saw())
q1.rx(saw(1,0))
q2.h()
\`\`\`

### Phase
Use the \`qphase()\`, or alias \`qp\`, method to get the phase of a basis state. For example:
\`\`\`js
q0.h()
q1.h().t()
q2.h().s()
q3.h().z()

s0.y.qphase(5)
s0.e.set(1)
\`\`\`

### Phases
Use the \`qphases()\`, or alias \`qps\`, method to get an array of the phases of each basis state. For example:
\`\`\`js
s0.z.sine(0,saw(),0,1/16)
q0.h().rz(s0.z)
q1.h()
q2.h()
q3.h().z()

s0.y.qphases().at(t().mod(q()))
s0.e.set(1)
\`\`\`

### Result
Return the measured state of the system as an integer, using the \`qresult()\`, or alias \`qr\`, method. For example:
\`\`\`js
q0.h()
q1.h()

s0.x.qresult().div(4)
s0.e.every(4)
\`\`\`

## Importing Code

### QASM Strings
Use the \`import()\` method on any qubit to import a quantum circuit from a QASM string. For example:
\`\`\`js
q0.import(\`OPENQASM 2.0;
include "qelib1.inc";
qreg q[6];
h q[0];
cx q[0], q[1];
cx q[1], q[2];
cx q[2], q[3];
cx q[3], q[4];
ry (1.57) q[4];
cx q[4], q[5];
cx q[3], q[4];
cx q[2], q[3];
cx q[1], q[2];
cx q[0], q[1];
h q[0];\`)
\`\`\`
Remember to use backticks to wrap the string, so that JavaScript can interpret the line breaks.

## Exporting Code
Use \`exportCircuit()\` to export the current circuit as QASM or Qiskit string. For example:
\`\`\`js
q0.h()

print(exportCircuit('qasm'))
print(exportCircuit('qiskit'))
\`\`\`
`