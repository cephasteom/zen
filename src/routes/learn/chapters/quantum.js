export default `# Zen Quantum
Zen is a quantum programming inspired system. It integrates the [Quantum Circuit library](https://www.npmjs.com/package/quantum-circuit) developed by Quantastica to facilitate the construction and execution of quantum circuit simulations within the web browser. In quantum mode, each stream corresponds to a single wire within the quantum circuit. Gates are appended to individual wires by method chaining through the \`.wire\` property of a stream. Gate parameters may be passed as values, [mini-notation](/learn/mini-notation), or [Patterns](/learn/patterns).

The outcomes of circuit executions, encompassing the state vector, individual qubit measurements, basis states, probabilities, and amplitude coefficients, can serve as data to be sonified within your Zen code. This document explains how to construct quantum circuits within Zen, and how to access the available quantum data within your compositions. For a more detailed explanation of quantum computer music, see [Miranda (2022)](https://link.springer.com/book/10.1007/978-3-031-13909-3).

Run the following example to get a feel for quantum programming in Zen. Ensure quantum mode is toggled by clicking on the qubit icon in the tool bar:
\`\`\`js
z.bpm.set(120)

s0.wire.h().cx([1]).ccx([1,2])
s1.wire.fb(0)
s2.wire.fb(1)

s0.e.qmeasurement(0, 32)
s1.e.qmeasurement(1, 32)
s2.e.qmeasurement(2, 32)

s0.set({inst: 1, bank: 'bd808', i: 3, cut: 0})
s1.set({inst: 1, bank: 'sd808', i: '0..1?*16', cut: [0,1]})
s2.set({inst: 1, bank: 'hh', i: '0..16?*16', cut: [0,2], vol: 0.5})
\`\`\`

## Building Circuits
The \`.wire\` property of a stream serves as the interface for constructing gates on a specific wire within the quantum circuit. This property is an instance of the [Wire class](/docs/classes#wire). Gates are appended by sequentially chaining methods, each corresponding to a specific gate. For instance, \`.wire.x().cx(1)\` applies an X gate followed by a CNOT gate to the wire. For a comprehensive inventory of implemented gates, refer to the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates).

Here is an example of setting some gates using the \`.wire\` property:
\`\`\`js
s0.wire.h().cx(1)
s1.wire.x()
\`\`\`
In this example, we apply a Hadamard gate to stream 0, succeeded by a CNOT gate with stream 1 designated as the target. Subsequently, an X gate is applied to stream 1. When executed within the Zen editor, the circuit schematic is rendered, with measurements displayed as unit vectors on the right-hand side.

### Multi-qubit gates
Multi-qubit gates facilitate entanglement. They connect one or more control qubits, and a target qubit. The target qubit has a gate applied to its wire only if the state(s) of the control qubit(s) meets certain conditions. The wire that we add the gate to is always the first control qubit. Additional qubits are passed as the first argument of the gate method. This can be either a single index or array of indexes. For example, to apply a CNOT, or CX, gate to qubits 0 and 1:
\`\`\`js
s0.wire.cx(1)
\`\`\`
Here, the control qubit is 0 and the target qubit is 1. Wire 1 will have an X gate applied to it only if qubit 0 is in the state |1⟩.

To apply a CCNOT, or CCX, gate to qubits 0, 1 and 2:
\`\`\`js
s0.wire.ccx([1,2])
\`\`\`
Here, the control qubits are 0 and 1, and the target qubit is 2. Wire 2 will have an X gate applied to it only if qubits 0 and 1 are both in the state |1⟩.

### Gate parameters
Some gates require additional parameters. For example, the U3 gate requires three parameters - theta, phi, and lambda - passed as an array to the gate method. For example, to apply a U3 gate to qubit 0 with parameters theta, phi, lambda:
\`\`\`js
s0.wire.u3([0.1,0.2,0.3])
\`\`\`
Parameters are written as multiples of π, as in 0.5π, π, 2π etc. Values can be numbers, [mini-notation](/learn/mini-notation), or [Patterns](/learn/patterns). The following will work:
\`\`\`js
s0.x.sine()
s0.wire.u3([0.5,'0.25?0.5?0.75?1*16',s0.x])
\`\`\`
To aid understanding of these rotations, the sphere visualisation plots the axes \`.x\`, \`.y\`, and \`.z\` of each stream. \`.x\` is the horizontal axis, or phi, \`.y\` is the vertical axis, or theta, and \`.z\` is the depth axis, or lambda. You can use pass these patterns as parameters to a gate. For example:
\`\`\`js
s0.x.sine()
s0.y.saw()
s0.z.noise()
s0.wire.u3([s0.y,s0.x,s0.z])
\`\`\`
This will apply a U3 gate to qubit 0 with the parameters set by the patterns \`.x\`, \`.y\`, and \`.z\` of stream 0. Or, you can use any custom pattern defined in the usual way. For example:
\`\`\`js
s0.p.theta.sine()
s0.p.phi.saw()
s0.p.lambda.noise()
s0.wire.u3([s0.p.theta,s0.p.phi,s0.p.lambda])
\`\`\`

### Gate position
By default, chaining gates will add them sequentially to the wire. You can offset the position and move the gate further along the wire. 

### Arguments
We therefore have three potential arguments for each gate: the connected qubit(s), the parameters, and the position. Some gates require all three, some only require one or two. This being a live coding environment, we want to write as little code as possible. As a general rule, arguments are ordered as follows: connected qubit(s), parameters, position. If a gate does not expect connected qubits, or parameters, these can be omitted. For example:
\`\`\`js
s0.wire.x(2) // no target qubit or parameters, so arguments are just [position]
s0.wire.u3([0.1,0.2,0.3],2) // no target qubits but parameters can be specified, so arguments are [parameters, position]
s0.wire.ccx([1,2],2) // target qubits and position can be specified, so arguments are [target qubits, position]
s0.wire.xx(2,0.5,0) // a rare example of a gate that requires all three arguments [target qubits, parameters, position]
\`\`\`
See the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates) for a full list of gates and their arguments.

### Feedback
Use the \`.fb()\` method to apply feedback to a wire. This will use the previous measurement as the initial state of the qubit before the circuit runs. For example:
\`\`\`js
s0.wire.x().fb()
\`\`\`
By default, prior results are taken from the same stream. However, you can specify a different stream as the input for feedback by passing it as an argument. For example:
\`\`\`js
z.bpm.set(20)
s0.wire.h()
s1.wire.fb(0) // uses the previous measurement of stream 0 as the initial state
\`\`\`

## Sonifying Data
There are a number of Pattern methods that can fetch and manipulate the results of running a quantum circuit. These can be used as data to be sonified. All methods associated with Zen's quantum mode are prefixed with a \`q\`.

### Measurement
\`qmeasurement()\`, alias \`qm()\`, returns the collapsed state of a qubit: either a |0⟩ or |1⟩. This is useful for triggering events. The first argument is the index of the qubit you wish to measure. For example:
\`\`\`js
s0.set({inst:0,reverb:0.125,rtail:0.2,cut:0,cutr:250,dur:100,mods:0.1})

s0.y.noise()
s0.x.sine(0,1,0,1/3)

s0.py._n.set('Cpro%16..*16 | Cpro%16..?*16').sub('0?12*16')
s0.px.modi.saw()
s0.wire.u3([s0.y,s0.x,0])
s0.e.qmeasurement(0) // measure qubit 0. If it collapses to |1⟩, trigger the event
s0.m.not(s0.e)
\`\`\`

By default, measurements are taken at each division of the cycle. However, repetition is musically useful. Passing an integer greater than 1 as the second argument will cause the measurement to loop. For example:
\`\`\`js
s0.e.qmeasurement(0, 8) // measure qubit 0, loop after 8 measurements
\`\`\`

You can also set the number of times this loop should repeat before regenerating with new measurements. For example:
\`\`\`js
s0.e.qmeasurement(0, 8, 4) // measure qubit 0, loop after 8 measurements, repeat 4 times
\`\`\`

### Measurements
Use \`qmeasurements()\`, alias \`qms\`, to get the measurements of all qubits as an array.
\`\`\`js
s0.e.qmeasurements().at(0) // this is the same as...
s0.e.qmeasurement(0) // ...this
\`\`\`

You can pass an integer greater than 1 as the first argument to loop the measurements, and an integer as the second argument to set the number of times this loop should repeat before regenerating with new measurements.

### Probability
Use the \`qprobability()\`, or alias \`qpb\`, method to get the probability (squared amplitude coefficient) of a given basis state. The number of states in a quantum system is 2 to the power of the number of qubits. In a system with 2 qubits, there are 4 possible basis states (|00⟩, |01⟩, |10⟩, |11⟩). To get the probability for state |01⟩, for example, pass in the integer 1:
\`\`\`js
s0.wire.rx(0.25)
s1.wire.rx(0.75)

s0.p.amp.qpb(1).print() // print the probability of the state |01⟩ to the console
s0.e.every(4)
\`\`\`

Using the probability as the input for a gate creates interesting feedback loops. For example:
\`\`\`js
z.bpm.set(120)

s0.wire.h().cx([1]).ccx([1,2])

s1.y.qamp(0)
s1.wire.fb(0).rx(s1.y)

s0.e.qmeasurement(0, 32)
s1.e.qmeasurement(1, 32)
s2.e.qmeasurement(2, 32)

s0.set({inst: 1, bank: 'bd808', i: 3, cut: 0})
s1.set({inst: 1, bank: 'sd808', i: '0..16?*16', cut: [0,1]})
s2.set({inst: 1, bank: 'hh', i: '0..16?*16', cut: [0,1,2], vol: 0.5})
\`\`\`
Each probability is returned as a float to 5 decimal places. As with other methods, you can pass a loop length as the second argument.

### Probabilities
Use the \`qprobabilities()\`, or alias \`qamps\`, method to get an array of the probabilities for each possible result of a circuit. For example:
\`\`\`js
s0.wire.rx(0.25)
s1.wire.rx(0.75)

s0.p.amp.pbs().print() // print all probabilities to the console
s0.e.every(4)
\`\`\`
As with other methods, you can pass a loop length as the first argument.

### Phase
Use the \`qphase()\`, or alias \`qp\`, method to get the phase of a basis state. For example:
\`\`\`js
s0.wire.h()
s1.wire.h().t()
s2.wire.h().s()
s3.wire.h().z()

s0.y.qphase(5)
s0.e.set(1)
\`\`\`

### Phases
Use the \`qphases()\`, or alias \`qps\`, method to get an array of the phases of each basis state. For example:
\`\`\`js
s0.p.z.sine(0,1,0,1/16)
s0.wire.h().rz(s0.p.z)
s1.wire.h()
s2.wire.h()
s3.wire.h().z()

s0.y.qphases().print().$at.t().mod(q)
s0.e.set(1)
\`\`\`

### Result
Return the basis state with the highest amplitude as an integer using the \`qresult()\`, or alias \`qr\`, method. For example:
\`\`\`js
s0.wire.rx(0.25)
s1.wire.rx(0.75)

s0.p.result.qresult().print()
s0.e.every(4)
\`\`\`

If there are multiple states with a joint highest amplitude, an index will be returned at random. For example:
\`\`\`js
s0.wire.rx(0.5)
s1.wire.rx(0.5)

s0.p.result.qresult().print()
s0.e.every(4)
\`\`\`

One application for this could be to trigger events based on whether a certain state has the highest amplitude. For example:
\`\`\`js
s2.wire.h()
s3.wire.h()

s0.set({inst:1,bank:'bd'})
s0.e.qresult().eq(12)

s1.set({inst:1,bank:'sd'})
s1.e.qresult().eq(4)

s2.set({inst:1,bank:'hh'})
s2.e.qresult().eq(8)
\`\`\`
Here, we create a 4 qubit system with 16 possible basis states. Hadamard gates are applied to the 3rd and 4th wires which means that only the states |1100⟩, |0100⟩, and |1000⟩ will have the highest amplitude. We assign a sound to each state.

### Random
// TODO

## Importing Code

### QASM Strings
You can paste in a QASM 2.0 string to load a quantum circuit. This will be parsed and replaced with Zen code for you to edit. This is an experimental feature. QASM strings should start with a " and end with a \\n", and contain newlines and escaped quotes. For example, the first example should be formatted as per the second example:
\`\`\`js
OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];
\`\`\`
\`\`\`js
"OPENQASM 2.0;\\ninclude \\"qelib1.inc\\";\\nqreg q[2];\\ncreg c[2];\\nh q[0];\\ncx q[0],q[1];\\nmeasure q[0] -> c[0];\\nmeasure q[1] -> c[1];\\n"
\`\`\`
`