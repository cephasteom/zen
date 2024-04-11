export default `# Zen Quantum
Zen uses the <a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">Quantum Circuit</a> library by Quantastica to build and run quantum circuit simulations in the browser. In quantum mode, each stream represents a single wire in a quantum circuit. The position of the stream can be used to set the parameters of quantum gates, and the outcomes of measurements can be used to trigger events. This page outlines the basic syntax for building quantum circuits in Zen. A more detailed guide to the Quantum Circuit library can be found <a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">here</a>.

## .theta, .phi, .lambda
The \`.theta\`, \`.phi\`, and \`.lambda\` properties of a stream are used to set the parameters of quantum gates. They are represented on the sphere visualisation as the vertical (y), horizontal (x), and depth (z) axes respectively. These properties are instances of the [Pattern class](/docs/classes#pattern), and can be set using the same methods as other patterns. They are also simply aliases of the y, x, and z properties of the stream, respectively. For example:
\`\`\`js
s0.theta.sine()
s0.phi.noise()
s0.lambda.set(0.5)
\`\`\`
Axes expect normalised values (0-1). These are scaled to the appropriate range internally.

## .wire
The \`.wire\` property of a stream is used to build the gates on a single wire of the quantum circuit. It is an instance of the [Wire class](/docs/classes#wire). Gates are added by chaining methods whose name corresponds to a gate: for example, \`.wire.u3().x()\`. A full list of implemented gates can be found in the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates). 

Here is an example of setting some gates using the \`.wire\` property:
\`\`\`js
s0.wire.h().cx(1)
s1.wire.x()
\`\`\`
Here, we use a Hadamard gate on stream 0, followed by a CNOT gate with stream 1 as the target. We then apply an X gate to stream 1. If you run this in the Zen editor, you will see the quantum circuit visualisation update in real time. Measurements are shown on the right.

### Multi-qubit gates
Multi-qubit gates require a target qubit, or target qubits. These are passed as the first argument to the gate method. For example, to apply a CCNOT gate to qubits 0 and 1:
\`\`\`js
s0.wire.ccx([1,2])
\`\`\`
Here, we supply an array of target qubits, in order to entangle qubits 0, 1 and 2.

### Gate parameters
Some gates require additional parameters. For example, the u3 gate requires three parameters: theta, phi, and lambda. These are passed as arguments to the gate method. For example, to apply a u3 gate to qubit 0 with parameters theta, phi, lambda:
\`\`\`js
s0.wire.u3([0.1,0.2,0.3])
\`\`\`
As above, parameters are written as normalised values (0-1). These are scaled to the appropriate range internally. Values can be numbers, mini-notation strings, or other patterns. The following will work:
\`\`\`js
s0.lambda.sine()
s0.wire.u3([0.5,'0.25?0.5?0.75?1*16',s0.lambda])
\`\`\`

If you omit the parameters, these angles are taken from the position of the stream in the pattern. For example:
\`\`\`js
s0.theta.sine() 
s0.phi.noise() 
s0.lambda.set(0.5)
s0.wire.u3()
\`\`\`

### Arguments
By default, chaining gates will add them sequentially to the wire. You can offset the position and move the gate further along the wire. We therefore have three potential arguments for each gate: the target qubit(s), the parameters, and the position. Some gate require all three, some only require one or two. This being a live coding environment, we want to write as little code as possible. As a general rule, arguments are ordered as follows: target qubit(s), parameters, position. If a gate does not expect a target qubit, or parameters, these can be ommited. For example:
\`\`\`js
s0.wire.x(2) // no target qubit or parameters, so arguments are just [position]
s0.wire.u3([0.1,0.2,0.3],2) // no target qubits but parameters can be specified, so arguments are [parameters, position]
s0.wire.ccx([1,2],2) // target qubits and position can be specified, so arguments are [target qubits, position]
s0.wire.xx(2,0.5,0) // a rare example of a gate that requires all three arguments [target qubits, parameters, position]
\`\`\`

## .ptheta, .pphi, .plambda
To map musical parameters to these axes, use the \`.ptheta\`, \`.pphi\`, and \`.plambda\` properties of a stream. These are instances of the [Pattern class](/docs/classes#pattern), and are simply aliases of the y, x, and z properties of the stream, respectively.

## .measure()
Use the \`measure()\` method to use the measurement of a qubit to trigger an event. For example:
\`\`\`js
s0.set({inst:0,reverb:0.125,rtail:0.2,cut:0,cutr:250,dur:100,mods:0.1})

s0.theta.noise()
s0.phi.sine(0,1,0,1/3)

s0.ptheta._n.set('Cpro%16..*16 | Cpro%16..?*16').sub('0?12*16')
s0.pphi.modi.saw()
s0.wire.u3()
s0.e.measure()
s0.m.not(s0.e)
\`\`\`

`