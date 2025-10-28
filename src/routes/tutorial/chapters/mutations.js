export default `
# Mutations

Most live coding languages work a bit like MIDI sequencers. Once you've triggered an event (like a note or a pattern), it's set in stone. Zen is different. You can change (or mutate) any property of a Stream at any time, even after it's been triggered. This makes it easy to create evolving, dynamic music, and get Streams to interact with each other.

You can trigger a mutation using a Stream's \`.m\` property. Any properties prefixed with an underscore will morph to a new value. The time it takes to morph is determined by the Stream's \`lag\` property.

Try adding and removing an underscore to the \`n\`, \`modi\`, or \`harm\` properties in the example below:
\`\`\`js
s0.set({inst: 0, dur:btms(4), lag:1000, reverb:.5})
s0._n.random(36,72).step(1)
s0.modi.sine(.5,1,2)
s0.harm.noise(.25,1,11)
s0.e.every(16)
s0.m.every(8)
\`\`\`

You can also use mutations to create interactions between Streams. In the example below, we use s1's events to trigger s0's mutations:
\`\`\`js
s0.set({inst: 1, bank:'bd808', cut:0})
s0.n.set('Ddor%8..?*16')
s0.i.random(0,16).step(1).cache()
s0.e.every(16).or(rarely()).cache().and(not(s1.e))

s1.set({inst: 1, bank:'sd', cut:0, n: 74})
s1.e.set('0 1')

s2.set({inst: 0, dur:btms(4), lag:1000, reverb:.5})
s2._n.saw(1,48,84)
s2._modi.saw(1,0,10)
s2._harm.saw(1,1,10)
s2.e.every(16)
s2.m.use(s1.e).print('m')
\`\`\`
`