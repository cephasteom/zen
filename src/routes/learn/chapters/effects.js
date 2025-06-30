export default `# FX
Zen has an internal synth engine, with a range of high-quality effects, all within your browser. Full documentation for effects can be found in the docs.

## Track FX and FX Streams

Track FX are applied to the output of a track. By default, each stream is routed to its own track, with \`s0\` using track 0 (channels 1 and 2), \`s1\` using track 1 (channels 3 and 4), and so on. You can change the track a stream is routed to by setting the \`track\` parameter. Each track has a chain of effects attached to it, including reverb, delay, distortion and high and low cut filters. For efficiency, these are only instantiated when you use them, so you might hear a small glitch whilst they are being created.
\`\`\`js
s0.set({inst:'synth',cut:0,reverb:0.5,rtail:0.5,de:0.25,lag:ms(2),locut:0.3,vol:0.5})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)
\`\`\`

Of course, using separate reverbs, delays, etc. for every track is expensive and may have performance implications, depending on your machine. FX Streams are separate streams for controlling your effects and can be thought of as an effects bus on your mixing desk. FX streams are represented by the variables \`fx0\`, \`fx1\`, etc. Route a stream to an FX stream using the variable name as a parameter. The following example routes \`s0\` to \`fx0\`:
\`\`\`js
s0.set({
    inst:'synth',cut:0,lag:ms(2),locut:0.3,vol:0.5,
    fx0:0.5 // send half of the signal to the fx bus
})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)

fx0.set({reverb:1,rsize:0.5})
fx0.rtail.saw(0,1,0,1/4)
fx0.e.every(1) // you still need to trigger events on an fx stream
\`\`\`
`