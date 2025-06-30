export default `# Modes
By default, Zen evaluates your code on each division of the cycle. However, it can also be approached as a playable instrument, triggered by MIDI. This can be achieved by setting the mode. Here's a working example:
\`\`\`javascript
midi() // To see available devices

z.mode.set({
    trigger: 'noteon', // 'noteon' or 'division', default is 'division'
    device: 1 // MIDI input device index. To see available devices, use midi() and check the console
})

s0.set({inst: 0})
s0.n.midinote(1).at(-1) // use the last note to be played as the n value
s0.e.set(1) // trigger an event every time a note is received
\`\`\`

To return to the default mode, either set trigger to 'division', or simply delete the mode property and Zen will revert to the default.

`

