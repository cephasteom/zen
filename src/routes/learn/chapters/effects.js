export default `# FX
Full documentation for effects can be found in the [docs](/docs/fx).

## Track FX and FX Streams

Track FX are applied to the output of a stream. Each track has a chain of effects attached to it, including reverb, delay, distortion and high and low cut filters. For efficiency, these are only created when you use them, so you might hear a small glitch whilst they are being created.
\`\`\`js
s0.set({inst:'synth',cut:0,reverb:0.5,rtail:0.5,de:0.25,lag:btms(2),locut:0.3,vol:0.5})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)
\`\`\`

Using separate reverbs, delays, etc. for every track is expensive. FX Streams are separate streams for managing your effects, like an effects bus on your mixing desk. FX streams are represented by the variables \`fx0\`, \`fx1\`, etc. Route a stream to an FX stream using the variable name as a parameter. The following example routes \`s0\` to \`fx0\`:
\`\`\`js
s0.set({
    inst:'synth',cut:0,lag:btms(2),locut:0.3,vol:0.5,
    fx0:0.5 // send half of the signal to the fx bus
})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)

fx0.set({reverb:1,rsize:0.5})
fx0.rtail.saw().mtr(0,.25)
fx0.e.every(1) // you still need to trigger events on an fx stream
\`\`\`
`