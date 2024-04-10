export default `# Global Settings

## BPM, time and space
Global settings can be set using the \`z\` object, an instance of the [Zen class](/docs/classes#zen). 
- \`z.bpm\` sets the tempo of the piece in beats per minute. It is an instance of the [Pattern class](/docs/classes#pattern).
- \`z.t\` sets the global time of the piece. It is an instance of the [Pattern class](/docs/classes#pattern).
- \`z.q\` sets the the amount of divisions per cycle. In other words, how many times your code evaluates per bar.

Run the code below whilst watching the pattern visualiser to see how these parameters affect the canvas.

\`\`\`js
z.bpm.set(120)
z.t.sine(0,16,10.25)
z.q = 16
\`\`\`

## Global parameters
You can set parameters in the same way that you set them on a stream, using \`z.set()\`, \`z.p\`, \`z.px\`, \`z.py\` and/or \`z.pz\`. Parameters set on the global scope will affect all streams. Setting the same parameter on a stream will override the global setting.
\`\`\`js
z.set({reverb: 1, cut:[0,1]}) // set reverb to 0.5 on all streams
z.px.n.set('Clyd%16..*16') // map a lydian scale to the x parameter on all streams

s0.set({inst: 0})
s0.x.saw()
s0.e.set(1)

s1.set({inst: 0, reverb: 0}) // override global reverb setting
s1.x.saw()
s1.e.set(1)

## Seeding randomness
You can seed the random number generator using \`z.seed\`. Seed is an instance of a pattern, so you can use any pattern method to set it, for example \`z.seed.set(256)\`.
\`\`\`
`