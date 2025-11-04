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
let kpat = '1 0 0 1 0 1 0 0 | 1 0 0 1 0 0 0 1'
let spat = '0 0 1 0 0 0 1 0'
let hpat = '1 0 1 0 1 0 1 0 | 1 0 1 0 1 0 1 0'
s0.e.set(kpat)
s1.e.set(spat)
s2.e.set(hpat)
\`\`\`

Try playing around with the sequences to create your own beat.

## Extensions

Now that we have a basic sequencer, let's add some variations.

We can use randomization to create more dynamic rhythms. For example, we can randomly trigger the hi-hats:
\`\`\`js
s2.e.sometimes()
\`\`\`

We can add some occasional variations to the kick and snare patterns:
\`\`\`js
s0.e.set(kpat)
  .or(rarely())

s1.e.set(spat)
  .or(rarely())
\`\`\`

And we can get each layer to interact with each other. For example, let's ensure that the snare and hh only hit when the kick is not playing:
\`\`\`js
s1.e.set(spat)
  .or(rarely())
  .and(not(kpat))

s2.e.sometimes()
  .and(not(s1.e))
\`\`\`

Let's add some variation to the amplitude of each hit:
\`\`\`js
s0.amp.set(kpat).ifelse(1,0.25)
s1.amp.set(spat).ifelse(1,0.25)
\`\`\`

Finally, let\'s play around with the global time to create some fills:
\`\`\`js
let shouldFill = c(4).eq(3)

z.t.set(shouldFill).ifelse(
  noise(1,0,32).step(1),
  t()
)
\`\`\`

## Conclusion

That's it! You've created a simple sequencer using Zen. Experiment with different rhythms, variations, and interactions to make it your own.

Here's the whole code:
\`\`\`js
let shouldFill = c(4).eq(3)

z.t.set(shouldFill).ifelse(
  noise(1,0,32).step(1),
  t()
)

// kick
let kpat = '1 0 0 1 0 1 0 0 | 1 0 0 1 0 0 0 1'
s0.set({inst: 1, bank: 'bd'})
s0.amp.set(kpat).ifelse(1,0.25)
s0.e.set(kpat)
  .or(rarely())

// snare
let spat = '0 0 1 0 0 0 1 0'
s1.set({inst: 1, bank: 'sd808', cut: 0})
s1.amp.set(spat).ifelse(1,0.25)
s1.e.set(spat)
  .or(rarely())
  .and(not(kpat))

// hh
s2.set({inst: 1, bank: 'hh', cut: 0})
s2.e.sometimes()
  .and(not(s1.e)) 
\`\`\`
`
