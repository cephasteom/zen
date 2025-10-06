export default `# Patterns
The [Pattern class](/docs/classes#pattern) is Zen’s core building block — in Zen, *everything is a pattern*. Run this code and see the changing values in the console:
\`\`\`js
s0.x.saw().print('x')
s0.e.every(1).print('e')
\`\`\`
Here, \`s0\` is a Stream. Every parameter of a Stream returns a Pattern. \`.e\` is a special parameter that triggers events. Other parameters like \`.x\`, \`.y\`, or even \`.banana\`, are user-defined and can be used for anything you like. We'll cover Streams in depth in the [next chapter](/learn/streams). 

Patterns have many methods for generating interesting patterns of values. For example, the \`.set()\` method is used to set a constant value, whereas \`every()\` returns a 1 every *n* divisions. For example:
\`\`\`js
s0.x.set(0.5).print('x')
s0.e.every(4).print('e')
\`\`\`

Others, like \`.sine()\`, \`.tri()\`, and \`.square()\`, return values that change over time. Most methods generate values between 0 and 1, and take additional arguments for frequency and scaling:
\`\`\`js
s0.x.sine(2,0,0.5).print('x') // a sine wave that oscillates between 0 and 0.5 every 2 cycles
s0.e.set(1) // trigger the stream
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

You can nest Patterns. For example:
\`\`\`js
s0.x.saw(0.25,0,64)
    .mul(coin().ifelse(1,100))
    .print('x')
s0.e.set(1)
\`\`\`

You can also use [mini-notation](/learn/mini-notation), which we'll cover in more detail later. For example:
\`\`\`js
s0.x.set("0 0.25 0.5 0.75").print('x')
s0.y.set("0..8*8").print('y')
s0.n.set('D4 F4 A4 B4').print('n')
s0.e.every(4)
\`\`\`

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`