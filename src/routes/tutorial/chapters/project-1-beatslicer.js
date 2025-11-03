export default `
# Project 1: Beatslicer

In this project, we'll create a simple beatslicer using Zen. A beatslicer takes a drum loop and chops it into smaller segments that can be rearranged and manipulated in real-time.

## Basics

First, configure the stream to the sampler, load a drum break, and snap to the bpm grid:
\`\`\`js
// Set the tempo
z.bpm.set(160)

// Configure the stream
s0.set({inst: 'sampler',bank: 'breaks', dur: btms(4), snap: 16, cut: 0})
\`\`\`

Next, randomly select where to begin in the sample:
\`\`\`js
s0.begin.random().step(1/16) // random start point, stepping by 1/16th
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

And try a noise function rather than random:
\`\`\`js
s0.begin.noise().step(1/16)
\`\`\`

Make sure we get the kick drum at the start of each bar:
\`\`\`js
s0.begin
  .t(16)
  .eq(0)
  .ifelse(0, noise().step(1/16))
\`\`\`

Create some repetitions in how it slices the beat:
\`\`\`js
s0.begin.noise().step(1/16).cache()
\`\`\`

## Advanced
We can create a stutter effect by occasionally repeating the same slice:
\`\`\`js
s0.n.set(60).expand(rarely().ifelse(8,1))
s0.strum.btms(1/8)
\`\`\`

Add some detail by changing the amp and pan slightly for each stutter:
\`\`\`js
s0.amp.set(1).expand(8, (amp,i) => amp / (i+1))
s0.pan.set(0.5).expand(8, (p,i,a) => p + (1/a.length * i)).mod(1)
\`\`\`

## Conclusion

That's it! You've created a simple beatslicer using Zen. Experiment with different parameters and effects to make it your own.

Here's the whole code together:
\`\`\`js
z.bpm.set(150)

s0.set({inst: 'sampler',bank: 'breaks', dur: btms(4),snap: 16, cut: 0, strum: btms(1/8)})

s0.begin
  .t(16)
  .eq(0)
  .ifelse(0, noise().step(1/16))

s0.n.set(60).expand( rarely().ifelse(8, 1) )
s0.amp.set(1).expand(8, (amp,i) => amp / (i+1))
s0.pan.set(0.5).expand(8, (p,i,a) => p + (1/a.length * i)).mod(1)

s0.e.every(4).or(every(3))
\`\`\`

## Challenges

1. Try using different drum breaks from the 'breaks' bank, setting the \`i\` parameter to choose different samples.
2. Experiment with different slicing intervals (e.g., 1/8th, 1/32nd).
3. Add effects like reverb or delay to the beatslicer output.
4. Experiment with different rhythmic patterns on the \`s0.e\` event trigger.
`