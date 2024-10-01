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

Pattern arguments can be raw values, the Zen mini-language, or other Patterns. For example, the following code creates a Pattern that alternates between two scales:
\`\`\`js
z.set({inst: 0, cut: [0,1]})

s0.set({n: 48})
s0.e.set('0?1*16') // use the mini-language

s1.set({n: 60})
s1.e.not(s0.e) // use the Pattern from s0.e as an argument
\`\`\`

All Pattern methods exist in the global scope and spawn new Patterns. For example, the following code creates a Pattern that alternates between two scales:
\`\`\`js
z.set({inst: 0, cut: [0,1]})

s0.set({n: 48})
s0.e.every(noise(1,4).step(1)) // spawn a new Patten and use it as an argument. You can chain methods on the new Pattern.

s1.set({n: 60})
s1.e.not(s0.e)
\`\`\`

For a full list of Pattern methods and their arguments, see the [Pattern docs](/docs/classes#pattern).
`