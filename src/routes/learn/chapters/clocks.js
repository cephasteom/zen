export default `# Clocks
By default, Zen uses its own internal clock to trigger events. In most cases this is sufficient, but sometimes you may want to synchronise Zen with your DAW, or with another performer. In this case, you can set Zen to be controlled by an external MIDI clock.

## z.clock
You can control clock settings with the \`z.clock\` property. This is an instance of the Pattern class, but you'll only want to use the \`.set\` method. This expects an object with the following properties:
\`\`\`javascript
z.clock.set({
  src: 'midi', // 'internal' or 'midi'
  device: 0, // MIDI device index. To see available devices, run midi()
})
\`\`\`
Execute this twice, using shift+enter, to set the clock to MIDI.

## MIDI Clock
Zen will now listen for MIDI clock messages on the selected device. You can transmit MIDI clock messages from your DAW, or from a hardware device - refer to devices own documentation. For example, here's how to transmit messages for [Logic](https://support.apple.com/en-gb/102005). Zen will respond to the start, stop, and continue messages, as well as the clock itself. \`z.q\` will determine how many divisions of a cycle will be triggered by clock messages.
`