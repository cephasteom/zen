export default `# Utilities
There are a number of utility functions useful for controlling Zen.

\`clear()\` clears the console

\`scales()\` show all scales that can be used in the mini-notation

\`chords()\` show all chords that can be used in the mini-notation

\`samples()\` show all samples that are available to use

\`midi()\` show all available midi devices

\`loadSamples()\` load your own samples - see [Custom Samples](/learn/custom-samples)

\`exportCircuit(<format>)\` prints the current circuit to the console as a string. Formats are 'qasm' or 'qiskit'. Default is 'qasm'.

\`btms(<beats>)\` an alias for \`set(<beats>).btms()\`, allowing you to quickly set a time value locked to the current bpm. E.g.:

\`\`\`js
z.bpm.set('60 | 120')

s0.set({inst:0, dur:btms(1), r:10, e:'1'})
\`\`\`
`