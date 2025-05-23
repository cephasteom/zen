export default `# Utilities
There are a number of utility functions useful for controlling Zen.

- \`clear()\` clears the console
- \`scales()\` show all scales that can be used in the mini-notation
- \`chords()\` show all chords that can be used in the mini-notation
- \`samples()\` show all samples that are available to use
- \`midi()\` show all available midi devices
- \`seed(<string>)\` seed the random numbers used in Pattern and in the mini-notation. 
- \`btms()\` converts a number of beats to milliseconds, based on the current tempo.
- \`exportCircuit(<format>)\` prints the current circuit to the console as a string. Formats are 'qasm' or 'qiskit'. Default is 'qasm'.
`