export default `# MIDI
Midi is simple to use in Zen. On page load, all available midi inputs and outputs are printed in your console for reference. The index of the device you wish to use should be assigned to a stream's \`midi\` parameter. The following parameters control midi routing in Zen:

- \`midi\` the midi device to send messages to (passed as an index).
- \`midichan\` the midi channel to send messages to. Sends to all channels if not included.
- \`mididelay\` delay midi messages by n milliseconds. Useful for synchronising midi and audio.
- \`cc1\`, \`cc2\` etc. Send control change messages. CC values are normalised (0 - 1).

Patterns can also use midi control changes and currently pressed keys as input. The following methods are available:
\`\`\`js
// use the modulation wheel on device 10 as input
s0.p.vol.midicc(1,10)
// use all pressed keys on device 10 as input
s0.p.n.midinote(10)
\`\`\`
`