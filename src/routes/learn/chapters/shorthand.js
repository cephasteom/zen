export default `# Shorthand
Zen is designed to be quick to write and clear to read. Most methods and parameter names have a corresponding alias to enable brief typing. There's also some syntactic sugar so that you don't need to type out \`s0\` every time you want to access a property on a stream.

Here’s a quick example, followed by the same code written in shorthand:
\`\`\`js
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
s0.n.saw(2,0,32).add(48)
s0.modi.sine(0,4,0,0.5)
s0.harm.tri(1,2)
s0.pan.noise()
s0.e.set(1)
\`\`\`

\`\`\`js
s0.v({inst:0,cu:0,ms:.1,re:.5})
  .n.sa(0,32,2).a(48)._
  .mi.si(0,4,0,.5)._
  .ha.tr(1,2)._
  .pa.no()._
  .e.v(1)
\`\`\`
A list of aliases can be found in the [docs](/docs).

## Syntactic sugar
There are a few other ways to write Zen code that are not strictly aliases, but are designed to make code more concise and readable.

Wherever you use the \`.set()\` method, you can use just \`()\` instead. For example, these two lines are equivalent:
\`\`\`js
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
s0({inst:0,cut:0,mods:0.1,reverb:0.5})
\`\`\`

Here's another example:
\`\`\`js
s0.n.set(60)
s0.n(60)
\`\`\`
`
