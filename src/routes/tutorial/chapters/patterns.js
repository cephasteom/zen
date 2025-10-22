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

Or, we could create a Pattern that generates random values within a range:
\`\`\`js
s0.set({inst: 'synth', amp: 0.5, cut: 0})
s0.n.random(48, 72)
s0.e.every(2)
\`\`\`

We can use it to create rhythmic patterns as well. Try adding these to your code:
\`\`\`js
s0.e.rarely()
\`\`\`

\`\`\`js
s0.e.every(4).or(every(3))
\`\`\`

\`\`\`js
s0.e.random().gt(0.7)
\`\`\`

### Challenges
1. Create a Stream that plays a sequence of notes [55, 57, 59, 60] with a random amplitude and a reverb of 0.4.
2. Look at the documentation for the synth, add other properties and control with patterns.
3. Experiment with different Pattern types (like \`sine\`, \`tri\`, \`rand\`, etc.) to create interesting variations in your music.
`