export default `
# Project 4: Text to Music

In this project, we'll create a simple text-to-music generator using Zen. This project will demonstrate how to convert text input into musical notes and rhythms.

## Basics
First, we'll decide on some text:
\`\`\`js
// https://randomwordgenerator.com/sentence.php
let words = 'Combines are no longer just for farms'
\`\`\`

Next, we'll use Zen's inbuilt function to convert characters to different types of values;:
\`\`\`js
s0.set({inst: 0, cut: 0})
s0.n.textToMidi('hello world')
s0.e.textToRhythm('hello plymouth')
\`\`\`

## Extensions
Here's a more complete example that uses text to generate both a bassline and a drum pattern, combining the beatslicer techniques from Project 1 with note generation:

\`\`\`
z.bpm.set(170)

let harmony = 'Dmpent%8 | Fmpent%8'

// https://randomwordgenerator.com/sentence.php
let words = 'What’s it going to be then, eh?'

s0.set({
  inst: 'acid',
  res: noise(), 
  cutoff: noise().mul(5000)
})
s0.n.textToMidi(words)
  .snap(harmony)
  .sub($(s1.begin).mul(q()).odd().ie(12,36))
s0.e.set(s1.e)

s1.set({
  inst: 'sampler',
  bank: 'breaks',
  dur: btms(4),
  snap: 16,
  cut: [1,0],
  i: 0,
})
s1.begin.mod(32).ie(noise().step(1/16).cache())
s1.e.every(16)
  .or(textToRhythm(words))
  .and(even())
\`\`\`
`