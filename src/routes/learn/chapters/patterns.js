export default `# Patterns
The [Pattern class](/docs/classes#pattern) is Zen’s core building block — in Zen, *everything is a pattern*. Mastering patterns means mastering Zen. Run the following code in the editor and note the changing values in the console:
\`\`\`js
s0.x.saw().print()
s0.e.every(1)
\`\`\`
Here, \`s0\` is a Stream. We'll cover these in the next chapter. Every parameter of a Stream returns a Pattern. \`.e\` is a special parameter that triggers events. Other parameters like \`.x\`, \`.y\`, or even \`.banana\`, are user-defined and can be used for anything you like.

Patterns have many useful methods for generating interesting streams of values. The \`.set()\` method is used to set a constant value, whereas \`every()\` returns a 1 every n divisions. For example:
\`\`\`js
s0.x.set(0.5).print()
s0.e.every(4).print()
\`\`\`

Others, like \`.sine()\`, \`.tri()\`, and \`.square()\`, return changing values. Most methods return normalised values (between 0 and 1), but take additional arguments for frequency and scaling:
\`\`\`js
s0.x.sine(2,0,0.5).print() // a sine wave that oscillates between 0 and 0.5 every 2 cycles
\`\`\`

Pattern methods can be chained:
\`\`\`js
s0.x.sine(1,0.5,1) // this is the same...
s0.x.sine(1).mtr(0.5,1) // ...as this
\`\`\`

Pattern arguments don't have to be numbers; you can use other patterns:
\`\`\`js
s0.x.sine().print('x')
s0.y.set(1).sub(s0.x).print('y') // set y to be the inverse of x
s0.e.set(1)
\`\`\`

All Pattern methods exist in the global scope, which allows you to nest Patterns in other Patterns. For example:
\`\`\`js
s0.x.sine(1,saw().mul(noise()),1)
s0.e.set(1)
\`\`\`

You can also use a [mini-notation](/learn/mini-notation) string to create patterns. For example:
\`\`\`js
s0.x.set("0 0.25 0.5 0.75")
s0.y.saw(4,0,1)
s0.e.set("1*4 0*4 1*4 0*4")
\`\`\`

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`