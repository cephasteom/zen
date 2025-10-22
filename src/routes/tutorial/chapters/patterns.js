export default `
# Patterns

Patterns are the building blocks of Zen and are used to create sequences of values.

So far, we've passed single values to Stream properties, like this:
\`\`\`js
s0.n.set(60) // sets note to 60
s0.amp.set(0.5) // sets amplitude to 0.5
\`\`\`

However, we can also use Patterns to create sequences of values that change over time. 

For example, we can create a Pattern that cycles through a series of notes:
\`\`\`js
s0.set({inst: 'synth', amp: 0.5, cut: 0})
s0.n.seq([60, 62, 64, 65, 67])
s0.e.every(4)
\`\`\`

We can use it to create rhythmic patterns as well:
\`\`\`js
s0.set({inst: 'synth', amp: 0.5, cut: 0, reverb: 0.5})
s0.n.sine(0.5,48,72).step(2)
s0.e.every(3).or(every(4))
\`\`\`

### Challenges
1. Create a Stream that plays a sequence of notes [55, 57, 59, 60] with a random amplitude and a reverb of 0.4.
2. Look at the documentation for the synth, add other properties and control with patterns.
3. Experiment with different Pattern types (like \`sine\`, \`tri\`, \`rand\`, etc.) to create interesting variations in your music.
`