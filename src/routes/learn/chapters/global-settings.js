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

## Seeding randomness
You can seed the random number generator using \`z.seed\`, allowing you to use randomness with repeatable results. Seed is an instance of a pattern, so you can use any pattern method to set it, for example \`z.seed.set(256)\`.

## Swing
Swing can be set globally using the \`z.swing\` property. Swing is a value between 0 and 1, with 0 being no swing and 1 being full swing. Swing is applied to all streams. Swing is an instance of the [Pattern class](/docs/classes#pattern).

Additionally, set the subdivision to swing using the \`z.swingn\` property. This is an instance of the [Pattern class](/docs/classes#pattern).
\`\`\`js
z.swing.set(0.25)
z.swingn.set(16) // swing 16th notes
\`\`\`
`