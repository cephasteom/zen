export default `# Streams
Zen is organised into Streams, which refer to different musical layers. Streams are represented by the letter \`s\` and an index, as in \`s0\`, \`s1\`, \`s2\` etc. Think of them as separate musicians playing the different parts of your composition. Each Stream is an instance of a [Stream class](/docs/classes#stream). The ones you’ll use the most are:
- \`.set()\`
- \`.p\`
- \`.e\`

## .set()
The \`.set()\` method is used to set parameters that remain constant. It accepts an object literal: a list of key/value pairs. For example, \`s0.set({inst:’synth’,vol:0.5})\` tells stream 0 to use the synth instrument at half volume. 

## .p
The \`.p\` property is used to set parameters that should change over time. These are written, for example, as \`s0.p.vol\`, or \`s0.p.amp\`, or even \`s0.p.banana\`. Zen doesn’t care what parameter names you use here, invalid parameters are simply ignored by the synth engine. All parameters are instances of the [Pattern class](/docs/classes#pattern), which has a plethora of methods for generating interesting patterns. We’ll learn more about these in the following chapter.

For now, here’s an example of setting parameters using the \`.p\` property:
\`\`\`js
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
s0.p.n.saw(0,32,2).add(48)
s0.p.modi.sine(0,4,0,0.5)
s0.p.harm.tri(1,2)
s0.p.pan.noise()
s0.e.set(1)
\`\`\`

## .e
\`.e\` stands for event and is used to trigger the stream and is also an instance of a Pattern. If \`.e\` is 0 no event is triggered. If \`.e\` is greater than 0, an event is triggered. Consequently, there are many Pattern methods that simply return 1s and 0s.

Here are some different ways you could trigger a stream. Try replacing the final line of the previous example with one of the following:
\`\`\`js
s0.e.every(4)
\`\`\`

\`\`\`js
s0.e.every(4).$or.every(3)
\`\`\`

\`\`\`js
s0.e.sine(0,1,1)
\`\`\`

\`\`\`js
s0.e.set('1?0*16')
\`\`\`

\`\`\`js
s0.e.set('3:8*2')
\`\`\`
We’ll explore Patterns in the next chapter.
`