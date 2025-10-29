export default `
# Project 1: Beatslicer

In this project, we'll create a simple beatslicer using Zen. A beatslicer takes a drum loop and chops it into smaller segments that can be rearranged and manipulated in real-time.

## Basics

First, configure the stream to the sampler, load a drum break, and snap to the bpm grid:
\`\`\`js
z.bpm.set(140) // set the bpm to 140

s0.set({
  inst: 'sampler', // use the built-in sampler instrument
  bank: 'breaks', // load the 'breaks' sample bank
  dur: btms(4), // set the duration to 4 beats
  snap: 16, // snap to one cycle
  cut: 0 // new events cut off old ones
})
\`\`\`

Next, randomly select where to begin in the sample:
\`\`\`js
s0.begin.random(0,1).step(1/16) // random start point, stepping by 1/16th
\`\`\`

Finally, trigger the stream's events to play every 1/16th note:
\`\`\`js
s0.e.every(1) // trigger every 1/16th note
\`\`\`

## Extensions

Now that we have a basic beatslicer, let's add some variations.

Create some more interesting rhythms:
\`\`\`js
s0.e.every(3).or(every(4))
\`\`\`

Make sure we get the kick drum at the start of each bar:
\`\`\`js
s0.begin.mod(16).ifelse(
  random(0,1).step(1/16).cache(),
  0,
)
\`\`\`

Create some repetitions in how it slices the beat:
\`\`\`js
s0.begin.random(0,1).step(1/16).cache()
\`\`\`

Sometimes, add some delay:
\`\`\`js
s0.delay.rarely().ifelse(0.5,0.1)
\`\`\`

## Conclusion

That's it! You've created a simple beatslicer using Zen. Experiment with different parameters and effects to make it your own.

Here's the whole code together:
\`\`\`js
z.bpm.set(150)

s0.set({
  inst: 'sampler',
  bank: 'breaks',
  dur: btms(4),
  snap: 16,
  cut: 0,
  i: 1,
})
s0.begin.mod(32).ifelse(
  random(0,1).step(1/16).cache(),
  0,
)
s0.delay.rarely().ifelse(0.5,0.1)
s0.e.every(3).or(every(4))
\`\`\`
`