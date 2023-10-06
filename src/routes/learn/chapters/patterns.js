export default `# Patterns
As we have seen, the [Pattern class](/docs/classes#pattern) is used to set parameters that change over time, and to trigger patterns of musical events. They are also used for moving streams around the canvas, mutating parameters, and warping time. We’ll cover these topics in a later chapter. For now, it's good to realise that almost everything in Zen is a Pattern. Once you've mastered Patterns, you've mastered Zen.

As in a Stream, the \`.set()\` method is used to set a constant value. For example, \`s0.p.amp.set(1)\` sets the amplitude of Stream 0 to a constant value of 1.

Methods such as \`.sine()\`, \`.tri()\`, and \`.square()\` return different values depending on the current time, or \`t\`. Many methods accept additional arguments to determine how their output should be scaled and rounded. For example, \`s0.p.n.sine(48,64,1)\` returns numbers between 48 and 64, rounded to a step value of 1, creating a pattern of ascending and descending semitones. 

A final frequency argument determines how fast the pattern runs. Compare the following two examples:
\`\`\`js
s0.set({in:0,cu:0,ms:0.1,re:0.5})
s0.p.n.sine(48,64,1,0.5)
s0.e.set(1)
\`\`\`

\`\`\`js
s0.set({in:0,cu:0,ms:0.1,re:0.5})
s0.p.n.sine(48,64,1,2)
s0.e.set(1)
\`\`\`

Pattern methods can be chained:
\`\`\`js
s0.set({in:0,cu:0,re:0.5})
s0.p.n.sine(48,64,2).add(12)
s0.e.every(1)
\`\`\`

Prefixing a Pattern method with a \`$\` creates a new Pattern and combines the returned value with the first pattern, as in this example:
\`\`\`js
s0.set({in:0,cu:0,re:0.5})
s0.p.n.sine(48,64,2).$add.square(0,12,0.5)
s0.e.every(4).$or.every(3)
\`\`\`
Almost all Pattern methods can be prefixed with a \`$\` and used in this way.

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`