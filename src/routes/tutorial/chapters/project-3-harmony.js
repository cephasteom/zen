export default `
# Project 3: Harmony
In this project, we'll create a simple harmony generator using Zen. This project will demonstrate how to use streams and patterns to create harmonic progressions.

## Basics

First, let's store the global chord progression in a variable:
\`\`\`js
let harmony = 'Ddor%16 | Flyd%16 | Cmaj%16 | Aaeo%16'
\`\`\`

Next, let's set up a stream to the bass line:

\`\`\`js
s0.set({inst: 'tone.synth', cut: 0})
s0.n.set(harmony)
    .at(0) // take the first note of each scale
    .sub(24)
s0.e.set('3:8') // use a euclidean rhythm for the bass
\`\`\`

Chords:
\`\`\`js
s1.set({inst: 'tone.mono', cut: 1, amp: 0.25, s: .5})
s1.n.set(harmony).at([0,2,4]).sub(12)
s1.e.not(s0.e).and('4:8')
\`\`\`

Melody:
\`\`\`js
s2.set({inst: 'synth', cut: 2, s: .5})
s2.n.set(harmony)
  .at(random(0,8).step(1))
  .cache()
s2.e.sometimes().cache()
\`\`\`

## Extensions

Let's get the chords to change inversions:
\`\`\`js
s1.n.set(harmony).at([0,2,4])
    .inversion(random(0,3).step(1))
\`\`\`

And get it to arpeggiate:
\`\`\`js
s1.strum.btms(1/4)
s1.e.every(2)
\`\`\`

## Conclusion

That's it! You've created a simple harmony generator using Zen. Experiment with different chord progressions, rhythms, and interactions to make it your own.

Here's the full code:
\`\`\`js
let harmony = 'Ddor%16 | Flyd%16 | Cmaj%16 | Aaeo%16'

s0.set({inst: 'tone.synth', cut: 0, amp: .5})
s0.n.set(harmony).at(0).sub(24)
s0.e.set('3:8')

s1.set({inst: 'synth', cut: 1, amp: 0.25, s: .1})
s1.n.set(harmony).at([0,2,4]).inversion(random(0,3).step(1)).sub(12)
s1.strum.btms(1/4)
s1.e.every(2)

s2.set({inst: 'synth', cut: 2, s: .5})
s2.n.set(harmony)
  .at(random(0,5).step(1))
  .cache()
s2.e.sometimes().cache()
\`\`\`
`