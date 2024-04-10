export default `# Zen Quantum

## .wire
The \`.wire\` property of a stream is used to set the gates used in the quantum circuit. It is an instance of the [Wire class](/docs/classes#wire). Zen uses the <a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">Quantum Circuit</a> library by Quantastica to build and run quantum circuit simulations in the browser. 

A full list of implemented gates can be found in the [Quantum Circuit documentation](https://www.npmjs.com/package/quantum-circuit#implemented-gates). Each gate has a method corresponding to its name, as in \`.wire.h()\`, \`.wire.x()\`, and \`.wire.u3()\` etc. These can be chained together to build a circuit.

Here is an example of setting some gates using the \`.wire\` property:
\`\`\`js
s0.wire.h().x().z()
\`\`\`

Multi-qubit gates require a target qubit, or target qubits. These are passed as the first argument to the gate method. For example, to apply a CNOT gate to qubits 0 and 1:
\`\`\`js
s0.wire.ccx([1,2])
\`\`\`
Here, we supply an array of target qubits, in order to entangle qubits 0, 1 and 2.

Some gates require additional parameters. For example, the u3 gate requires three parameters: theta, phi, and lambda. These are passed as arguments to the gate method. For example, to apply a u3 gate to qubit 0 with parameters 0.1, 0.2, and 0.3:
\`\`\`js
s0.wire.u3([0.1,0.2,0.3])
\`\`\`
For simplicity, param values should be normalised (0-1). These are scaled to the appropriate range internally.

If you omit the parameters, these angles are taken from the position of the stream in the pattern. For example:
\`\`\`js
s0.theta.sine() // theta is an alias of s0.y
s0.phi.noise() // phi is an alias of s0.x
s0.lambda.set(0.5) // lambda is an alias of s0.z
s0.wire.u3()
\`\`\`

To map musical parameters to these axes, use \`.px\`, \`.py\`, and \`.pz\` or their aliases \`.pphi\`, \`.ptheta\`, and \`.plambda\` respectively. Use the \`measure()\` method to use the measurement of a qubit as to trigger an event. For example:
\`\`\`js
s0.set({inst:0,reverb:0.25,rtail:0.25,cut:0,cutr:250})

s0.theta.noise()
s0.phi.noise()

s0.ptheta._n.set('Cpro%16..*16 | Cpro%16..?*16').sub(12)
s0.wire.u3()
s0.e.measure()
s0.m.not(s0.e)
\`\`\`

`