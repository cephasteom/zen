export default `# Global Settings
Global settings can be set using the \`z\` object, an instance of the Zen class. 
- \`z.bpm\` sets the tempo of the piece in beats per minute. It is an instance of the Pattern class.
- \`z.t\` sets the global time of the piece. It is an instance of the Pattern class.
- \`z.s\` sets the size of the canvas.
- \`z.q\` sets the the amount of divisions per cycle. In other words, how many times your code evaluates per bar.

Run the code below whilst watching the pattern visualiser to see how these parameters affect the canvas.

\`\`\`js
z.bpm.set(120)
z.t.sine(0,16,10.25)
z.s = t
z.q = 16
`