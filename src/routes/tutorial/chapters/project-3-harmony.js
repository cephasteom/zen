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
s0.set({inst: 0, cut: 0})
s0.n.set(harmony).at(rarely().ifelse(4,0))
  .sub(24)
  .print()
s0.e.set('3:8')
\`\`\`

Chords:
\`\`\`js
s1.set({inst: 0, cut: 1})
s1.n.set(harmony).at([0,2,4]).sub(12)
s1.e.not(s0.e).and('4:8')
\`\`\`

Melody:
\`\`\`js
s2.set({inst: 0, cut: 2})
s2.n.set(harmony)
  .at(noise(1,0,8).step(even().ifelse(2,1)))
s2.e.noise().gt(.5)
  .and(coin())
  .cache()
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

s0.set({inst: 0, cut: 0})
s0.n.set(harmony).at(rarely().ifelse(4,0))
  .sub(24)
  .print()
s0.e.set('3:8')

s1.set({inst: 0, cut: 1})
s1.n.set(harmony).at([0,2,4]).sub(12)
  .inversion(random(0,3).step(1))
s1.strum.rarely().ifelse(btms(1/4), 0)
s1.e.not(s0.e).and('4:8')

s2.set({inst: 0, cut: 2})
s2.n.set(harmony)
  .at(noise(1,0,8).step(even().ifelse(2,1)))
s2.e.noise().gt(.5)
  .and(coin())
  .cache()
\`\`\`

## Challenges
1. Try using different scales or modes for the harmony.
2. Experiment with different rhythms for each stream.
3. Add effects like reverb or delay to individual streams.
4. Create variations in the melody based on the chord being played.
5. Combine project 1 and 2 to create a full track with beats and harmony.
`