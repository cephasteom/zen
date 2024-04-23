export default `# Zen Quantum
Zen uses the <a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">Quantum Circuit</a> library by Quantastica to build and run quantum circuit simulations in the browser. In quantum mode, each stream represents a single wire in a quantum circuit. The position of the stream can be used to set the parameters of quantum gates, and the outcomes of measurements can be used to trigger events. This page outlines the basic syntax for building quantum circuits in Zen. A more detailed guide to the Quantum Circuit library can be found <a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">here</a>.

Run the following examples to get a feel for how quantum circuits work in Zen. Ensure quantum mode is toggled by clicking on the qubit icon in the tool bar:
\`\`\`js
z.bpm.set(160)

s0.wire.h().cx([1]).ccx([1,2])
s1.wire.fb(0)
s2.wire.fb(0)

s0.e.measure(0)
s1.e.measure(1)
s2.e.measure(2)

s0.set({inst: 1, bank: 'bd808', i: 3, cut: 1})
s1.set({inst: 1, bank: 'sd808', i: '0..16?*16', cut: 0})
s2.set({inst: 1, bank: 'hh', i: '0..16?*16', cut: 0, vol: 0.5})
\`\`\`

## .wire
The \`.wire\` property of a stream is used to build the gates on a single wire of the quantum circuit. It is an instance of the [Wire class](/docs/classes#wire). Gates are added by chaining methods whose name corresponds to a gate: for example, \`.wire.u3().x()\`. A full list of implemented gates can be found in the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates). 

Here is an example of setting some gates using the \`.wire\` property:
\`\`\`js
s0.wire.h().cx(1)
s1.wire.x()
\`\`\`
Here, we use a Hadamard gate on stream 0, followed by a CNOT gate with stream 1 as the target. We then apply an X gate to stream 1. If you run this in the Zen editor, you will see the quantum circuit visualisation update in real time. Measurements are shown on the right.

### Multi-qubit gates
Multi-qubit gates allow us to entangle qubits. They require one or more control qubits, and a target qubit. The target qubit has a gate applied to it, only if the control qubits are in a certain state. The wire that we add the gate to is always the first control qubit. Additional qubits are passed as the first argument of the gate method. This can be either a single index or array of indexes. For example, to apply a CNOT, or CX, gate to qubits 0 and 1:
\`\`\`js
s0.wire.cx(1)
\`\`\`
Here, the control qubit is 0 and the target qubit is 1. Qubit 1 will have an X gate applied to it if qubit 0 is in the state |1⟩.

To apply a CCNOT, or CCX, gate to qubits 0, 1 and 2:
\`\`\`js
s0.wire.ccx([1,2])
\`\`\`
Here, the control qubits are 0 and 1, and the target qubit is 2. Qubit 2 will have an X gate applied to it if qubits 0 and 1 are in the state |1⟩.


### Gate parameters
Some gates require additional parameters. For example, the u3 gate requires three parameters: theta, phi, and lambda. These are passed as arguments to the gate method. For example, to apply a u3 gate to qubit 0 with parameters theta, phi, lambda:
\`\`\`js
s0.wire.u3([0.1,0.2,0.3])
\`\`\`
Parameters are written as multiples of π, as in 0.5π, π, 2π etc. Values can be numbers, mini-notation strings, or other patterns. The following will work:
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
This will apply a u3 gate to qubit 0 with the parameters set by the patterns \`.x\`, \`.y\`, and \`.z\` of stream 0. Or, you can use any custom pattern defined in the usual way. For example:
\`\`\`js
s0.p.theta.sine()
s0.p.phi.saw()
s0.p.lambda.noise()
s0.wire.u3([s0.p.theta,s0.p.phi,s0.p.lambda])
\`\`\`

### Arguments
By default, chaining gates will add them sequentially to the wire. You can offset the position and move the gate further along the wire. We therefore have three potential arguments for each gate: the connected qubit(s), the parameters, and the position. Some gates require all three, some only require one or two. This being a live coding environment, we want to write as little code as possible. As a general rule, arguments are ordered as follows: connected qubit(s), parameters, position. If a gate does not expect connected qubits, or parameters, these can be omitted. For example:
\`\`\`js
s0.wire.x(2) // no target qubit or parameters, so arguments are just [position]
s0.wire.u3([0.1,0.2,0.3],2) // no target qubits but parameters can be specified, so arguments are [parameters, position]
s0.wire.ccx([1,2],2) // target qubits and position can be specified, so arguments are [target qubits, position]
s0.wire.xx(2,0.5,0) // a rare example of a gate that requires all three arguments [target qubits, parameters, position]
\`\`\`
Again, see the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates) for a full list of gates and their arguments.

## .measure()
Use the \`measure()\` method to use the measurement of a qubit to trigger an event. The first argument is the index of the qubit you wish to measure. For example:
\`\`\`js
s0.set({inst:0,reverb:0.125,rtail:0.2,cut:0,cutr:250,dur:100,mods:0.1})

s0.y.noise()
s0.x.sine(0,1,0,1/3)

s0.py._n.set('Cpro%16..*16 | Cpro%16..?*16').sub('0?12*16')
s0.px.modi.saw()
s0.wire.u3([s0.y,s0.x,0])
s0.e.measure(0)
s0.m.not(s0.e)
\`\`\`
In this example, we measure qubit 0 of stream 0. The measurement is then used to trigger the event on stream 0.

You can also pass an optional second argument to determine whether to offset the measurement by one division of a cycle. This will take the measurement from the previous division rather than the current division. By default, the second argument is 0. For example:
\`\`\`js
s0.e.measure(0, 1)
\`\`\`

## .measures()
Get the measurements of all qubits as an array. The first argument is the amount of qubits in the system, the second argument is whether to offset the measurements by one division of a cycle. For example:
\`\`\`js
s0.e.measures(3, 1).at(0)
\`\`\`

## .pb()
Use the \`pb()\` method to get the probability of a qubit collapsing to |1⟩. It expects the same arguments as \`measure()\`, the index of the qubit and whether to offset the probability outcome by one division of a cycle. This can be useful for creating feedback loops. For example:
\`\`\`js
z.bpm.set(20)

s0.x.pb(0,1) // get the probability of qubit 0 collapsing to |1⟩, offset by one division
s0.wire.rx(0.49) // run this like first to set the initial state of qubit 0
// s0.wire.rx(s0.x) // the run this line to set the feedback loop
s0.e.measure(0)
\`\`\`

## .fb()
Use the \`.fb()\` method to apply feedback to a stream. This will use the previous measurement as the initial state of the qubit before the circuit runs. Be warned, if you have entangled qubits, this may lead to some unusual results. For example:
\`\`\`js
s0.wire.x().fb()
\`\`\`
By default, feedback is applied to the same stream. You can specify a different stream as the input for feedback by passing it as an argument. For example:
\`\`\`js
z.bpm.set(20)
s0.wire.h()
s1.wire.fb(0) // uses the previous measurement of stream 0 as the initial state
\`\`\`

## Qasm Strings
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