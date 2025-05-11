export default `# DSP
DSP programming in Zen is possible through the use of the wonderful [Kabelsalat](https://kabel.salat.dev/reference/). This is an experimental feature for live coding custom audio graphs. At its most basic, set \`inst: 'dsp'\` and pass a Kabelsalat string to \`graph\`. 

\`\`\`javascript
s0.set({inst: 'dsp', graph: 'sine(200).out()'})
s0.e.every(16)
\`\`\`

To interact with the graph, use a combination of Zen and Kabelsalat's MIDI syntax.
\`\`\`javascript
s0.set({
  inst: 'dsp', graph: 'sine(midifreq(1)).out()', // midifreq(1) converts MIDI note numbers on midichan 1 to Hz
  midi: 0, midichan: 1, // use midichan 1
  n: 'Ddor%8..*16', // sets the note number to be passed to midifreq(1)
  dur:ms(4), 
})
s0.e.every(1)
\`\`\`


Here's a more complex example that uses the \`fork\` operator to create a polyphonic synthesizer. The \`fork\` operator creates multiple copies of the signal, allowing for polyphony. The \`adsr\` operator creates an envelope that controls the amplitude of the signal. The \`lpf\` operator creates a low-pass filter that modulates the cutoff frequency using MIDI CC messages.

\`\`\`javascript
let graph = \`
  let env = midigate(1) // use note on / off messages on midichan 1
    .fork(8) // create 8 copies so you have 8 voices
    .adsr(0.01, 0.4, 0.7, 0.1);  
  saw(midifreq(1).fork(8)) // convert MIDI note numbers on midichan 1 to frequency
    .mul(env)
    .lpf(env.range(
      0.2, 
      midicc(1).lag(.5)).mul(env) // modulate cutoff using MIDI CC 1
    )
    .mix()
    .out();
\`

s0.set({
  inst: 'dsp', graph, 
  midi: 0, midichan: 1, // use midichan 1
  n: 'Ddor%8..*16', // sets the note number 
  dur:ms(4), 
})
s0.p.cc1.sine(0.75,1,1/4) // modulate CC1 with a sine wave
s0.e.every(1)
\`\`\`


`