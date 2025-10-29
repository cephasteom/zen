export default `
# Project 2: Sequencing

In this project, we'll create a simple sequencer using Zen. A sequencer allows you to program a series of notes or events that can be played back in a loop, often with variations and effects.

## Basics

First, let's set up 3 streams: for kick, snare, and hi-hats. 
\`\`\`js
s0.set({inst: 'sampler', bank: 'bd'}) // kick

s1.set({inst: 'sampler', bank: 'sd808'}) // snare

s2.set({inst: 'sampler', bank: 'hh'}) // hi-hats
\`\`\`

Next, under each stream, we can write out longhand sequences for each instrument. For example:
\`\`\`js
s0.e.set('1 0 0 0 1 0 0 1')
s1.e.set('0 0 1 0 0 0 1 0')
s2.e.set('0 1 0 0 1 0 0 1')
\`\`\`

Try playing around with the sequences to create your own beat!

## Extensions

Now that we have a basic sequencer, let's add some variations.

We can use randomization to create more dynamic rhythms. For example, we can randomly trigger the hi-hats:
\`\`\`js
s2.e.sometimes()
\`\`\`

We can add some occasional variations to the snare patterns:
\`\`\`js
s1.e.set('0 0 1 0 0 0 1 0').or(rarely())
\`\`\`

And we can get each layer to interact with each other. For example, let's prioritise hihats over snares, and kicks over everything:
\`\`\`js
s1.e.set('0 0 1 0 0 0 1 0').or(rarely())
  .and(not(s0.e).or(s2.e))

s2.e.sometimes().and(not(s0.e))
\`\`\`

Finally, let's add some swing and variation to the amplitude of each hit:
\`\`\`js
z.swing.set(0.05)

s0.amp.set(0.75)
s1.amp.random(0.5,1)
s2.amp.random(0.5,1)
\`\`\`

## Conclusion

That's it! You've created a simple sequencer using Zen. Experiment with different rhythms, variations, and interactions to make it your own.

Here's the whole code:
\`\`\`js
z.bpm.set(140)
z.swing.set(0.05)

s0.set({inst: 'sampler', bank: 'bd', dur: 100, amp: .75})
s0.e.set('1 0 0 0 1 0 0 1')

s1.set({inst: 'sampler', bank: 'sd808', cut: 3})
s1.amp.random(0.5,1)
s1.e.set('0 0 1 0 0 0 1 0')
  .or(c().mod(8).eq(3).ifelse(rarely()))
  .and(not(s0.e).or(s2.e))

s2.set({inst: 'sampler', bank: 'hh'}) // hi-hats
s2.amp.random(0.5,1)
s2.e.sometimes().and(not(s0.e))
\`\`\`
`
