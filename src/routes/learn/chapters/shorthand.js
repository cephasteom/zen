export default `# Shorthand
Zen is designed to be quick to write and clear to read. Most methods and parameter names have a corresponding alias to enable brief typing. There's also some syntactic sugar so that you don't need to type out \`s0\` every time you want to access a property on a stream.


Here’s a quick example, followed by the same code written in shorthand:
\`\`\`js
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
s0.p.n.saw(0,32,2).add(48)
s0.p.modi.sine(0,4,0,0.5)
s0.p.harm.tri(1,2)
s0.p.pan.noise()
s0.e.set(1)
\`\`\`

\`\`\`js
s0.v({in:0,cu:0,ms:.1,re:.5})
  .p.n.sa(0,32,2).a(48)._
  .p.mi.si(0,4,0,.5)._
  .p.ha.tr(1,2)._
  .p.pa.no()._
  .e.v(1)
\`\`\`
A list of aliases can be found in the [docs](/docs).
`
