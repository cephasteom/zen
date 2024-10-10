export default `# Patterns
The [Pattern class](/docs/classes#pattern) is Zen's primary building block. As we shall see, in Zen *everything is a pattern*. Once you have mastered patterns, you have mastered Zen. Run the following code in the editor:
\`\`\`js
s0.x.saw()
s0.every(1)
\`\`\`
\`s0\`, or \`s1\`, \`s2\`, \`s3\` etc., represent streams of values and can be thought of as a single channel of a mixing desk. We will cover the Stream class in more detail in the next chapter. The \`.x\` and \`.e\` properties are both instances of the Pattern class. \`.x\` controls the x position of the stream on the canvas and expects values between 1 and 0. \`.e\` controls when a stream should trigger a musical event and expects patterns of 1s or 0s. 1 will fire an event, 0 will be ignored.

Patterns have many useful methods for generating interesting streams of values. The \`.set()\` method is used to set a constant value. For example:
\`\`\`js
s0.x.set(0.5)
s0.every(1)
\`\`\`

Methods such as \`.sine()\`, \`.tri()\`, and \`.square()\` return different values, between 0 and 1, depending on the current time. Many methods accept additional arguments to determine how their output should be scaled. For example, \`s0.x.sine(0,0.5,2)\` returns values between 0 and 0.5, at a frequency of 2 cycles per bar.

Pattern methods can be chained:
\`\`\`js
s0.x.saw(0,1,0.25).step(0.25)
s0.y.tri().step(0.25)
s0.e.every(1)
\`\`\`

Pattern arguments can be raw values, other Patterns, or the Zen mini-language.
// TODO

All Pattern methods exist in the global scope and spawn new Patterns. For example:
// TODO

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`