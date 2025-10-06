export default `# Global Settings

Global settings can be set using the \`z\` object, which is just another instance of a [Stream class](/docs/classes#stream). 
Each of the following properties are instances of the [Pattern class](/docs/classes#pattern), allowing you to set them using any of the pattern methods.

## z.t
\`z.t\` sets the global time of the piece. By default this increments by 1 every division, but it can be interesting to modulate it. All Streams inherit this time value, unless you use .t() on the Stream - e.g. \`s0.t.noise(.25, 0, 32).step(1)\`.
\`\`\`js
z.t.saw(1,0,16) // loop between 0 and 16
z.t.sine(.25, 0, 16) // modulate the time with a sine wave
\`\`\`

## z.bpm
\`z.bpm\` sets the tempo of the piece in beats per minute.
\`\`\`js
z.bpm.set(80) // set a constant bpm
z.bpm.sine(.5, 60, 120) // modulate the bpm between 60 and 120 bpm with a sine wave
\`\`\`

## z.q
\`z.q\` sets the the amount of divisions per cycle. By default, this is 16.
You should probably only set this using \`z.q.set(...)\`. Other methods may lead to some unexpected, but perhaps interesting, results.

## z.seed
You can seed the random number generator using \`z.seed\`, allowing you to use randomness with repeatable results. E.g.:
\`\`\`js
z.seed.set(256)
\`\`\`

## z.swing
Swing can be set globally using the \`z.swing\` property. Swing is a value between 0 and 1, with 0 being no swing and 1 being full swing. Swing is applied to all streams. 
\`\`\`js
z.swing.set(0.25) // set a constant swing
\`\`\`

## z.swingn
Additionally, set the subdivision to swing using the \`z.swingn\` property. By default, this is set to 8th notes.
\`\`\`js
z.swing.set(0.25)
z.swingn.set(16) // swing 16th notes
\`\`\`
`