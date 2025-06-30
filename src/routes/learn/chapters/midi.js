export default `# MIDI
Midi is simple to use in Zen. On page load, all available midi inputs and outputs are printed in your console for reference. The index of the device you wish to use should be assigned to a stream's \`midi\` parameter.

## MIDI Output
The following parameters control midi routing in Zen:

- \`midi\` the midi device to send messages to (passed as an index).
- \`midichan\` the midi channel to send messages to. Sends to all channels if not included.
- \`mididelay\` delay midi messages (ms). Useful for synchronising midi and audio.
- \`cc<number>\`, as in \`cc1\`, \`cc2\` etc. Send control change messages. CC values are normalised (0 - 1).

For example:
\`\`\`js
// send midi notes to device 1, channel 1
s0.set({ midi: 1, midichan: 1 })
s0.n.set('60 62 64 65 67 69 71 72')
s0.e.every(2)
// send cc messages
s0.cc1.sine()
\`\`\`

## MIDI Input
Patterns can also use midi control changes and currently pressed keys as input. The following methods are available:
\`\`\`js
// use the modulation wheel on device 10 as input, with an initial value of 0.5
s0.vol.midicc(1,10,0.5)
// use all pressed keys on device 10 as input
s0.n.midinote(10)
\`\`\`

## MIDI Parsing
Zen can parse midi files and extract note and event data:
\`\`\`js
let bassfile = 'http://localhost:6060/midi/tune03/tune03-bass.mid' // must be hosted somewhere accessible

s0.set({inst: 0, cut:0})
s0.n.midifile(bassfile, 'n') // use the note data
s0.e.midifile(bassfile, 'e') // use the event data
\`\`\
`