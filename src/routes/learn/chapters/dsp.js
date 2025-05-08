export default `# DSP
DSP programming in Zen is possible through the use of the wonderful [Kabelsalat](https://kabel.salat.dev/reference/). This is an experimental feature that allows you to define and interact with custom audio graphs in Zen. To use this feature, set \`inst: 'dsp'\` and pass the instrument a Kabelsalat string to the \`graph\` parameter. 

\`\`\`javascript
s0.set({inst: 'dsp', graph: 'sine(200).out()'})
s0.e.every(16)
\`\`\`

To interact with the graph, there's a few approaches:

## MIDI
By using Zen's MIDI syntax, you can simply define a graph with MIDI inputs, then trigger notes from Zen: 

\`\`\`javascript
let graph = `
  let env = midigate(1).fork(8).adsr(0.01, 0.4, 0.7, 0.1);
  saw(midifreq().fork(8))
    .mul(env)
    .lpf(env.range(0.2, midicc(1).lag(.5)).mul(env))
    .mix()
    .out();
`

s0.set({inst: 'dsp', graph, midi: 0, midichan: 1, n: 'Ddor%8..*16', dur:ms(4), cut: 0})
s0.p.cc1.sine(0.75,1,1/4)
s0.e.every(1)
\`\`\`


`