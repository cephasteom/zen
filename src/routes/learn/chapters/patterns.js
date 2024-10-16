export default `# Patterns
The [Pattern class](/docs/classes#pattern) is Zen's primary building block. As we shall see, in Zen *everything is a pattern*. Once you have mastered patterns, you have mastered Zen. Run the following code in the editor:
\`\`\`js
s0.x.saw()
s0.e.every(1)
\`\`\`
\`s0\`, or \`s1\`, \`s2\`, \`s3\` etc., are instances of the [Stream class](/docs/classes#stream), which we will cover in the next chapter. A stream's \`.x\` and \`.e\` properties are both patterns. \`.x\` controls the x position of the stream on the canvas and expects values between 1 and 0. \`.e\` determines when a stream should trigger an event and expects patterns of 1s or 0s. 1s fires an event, 0s are ignored.

Patterns have many useful methods for generating interesting streams of values. The \`.set()\` method is used to set a constant value, whereas \`every()\` returns a 1 every n divisions. For example:
\`\`\`js
s0.x.set(0.5)
s0.e.every(4)
\`\`\`

Methods such as \`.sine()\`, \`.tri()\`, and \`.square()\` return changing values that depend on the current time. By default, most methods return normalised values, but you can pass additional arguments to determine how their output should be scaled. This example returns values between 0 and 0.5, at a frequency of 2 cycles per bar:
\`\`\`js
s0.x.sine(0,0.5,2)
\`\`\`

Pattern methods can be chained:
\`\`\`js
s0.x.sine(0.5,1) // this is the same...
s0.x.sine().mul(0.5).add(0.5) // ...as this
\`\`\`

Pattern arguments don't have to be constant. You can pass other patterns as arguments, which allows for complex patterns to be built from simpler ones. For example:
\`\`\`js
s0.x.sine() // move the stream left and right with a sine wave
s0.y.saw(s0.x,1) // move the stream up and down with a saw wave, scales by the x position
s0.e.set(s0.x).gt(0.5) // trigger an event when the x position is greater than 0.5
\`\`\`

All Pattern methods exist in the global scope and spawn new Patterns. For example:
\`\`\`js
s0.x.sine(saw().mul(noise()),1)
s0.e.set(1)
\`\`\`

You can also use a [mini-notation](/learn/mini-notation) string to create patterns. For example:
\`\`\`js
s0.x.set("0 0.25 0.5 0.75")
s0.y.saw(0,1,4)
s0.e.set("1*4 0*4 1*4 0*4")
\`\`\`

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`