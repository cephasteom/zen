export default `
# Project 4: Text to Music

In this project, we'll create a simple text-to-music generator using Zen. This project will demonstrate how to convert text input into musical notes and rhythms.

## Basics

First, let's define some functions to convert characters to MIDI note numbers and rhythms. If you don't understand the precise syntax, don't worry:
\`\`\`js
let textToMidi = text => i => text.charCodeAt(i % text.length) % 60 + 24
let textToRhythm = text => i => text.charCodeAt(i % text.length) > 110


\`\`\

Next, let's use them to generate some bloops and bleeps:
\`\`\`js
s0.set({inst: 0, cut: 0})
s0.n.fn(textToMidi('hello world'))
s0.e.fn(textToRhythm('hello plymouth'))
\`\`\`

## Extensions
Here's a more complete example that uses text to generate both a bassline and a drum pattern, combining the beatslicer techniques from Project 1 with note generation:

\`\`\`
z.bpm.set(150)

let textToMidi = text => i => text.charCodeAt(i % text.length) % 36 + 60
let textToRhythm = text => i => text.charCodeAt(i % text.length) > 110

// https://randomwordgenerator.com/sentence.php
let words = 'Combines are no longer just for farms'

s0.set({inst: 'acid', cut: 0, osc: 1, s: .1})
s0.res.noise(.5,0.5,.95)
s0.cutoff.noise(.5,100,5000)
s0.i.fn(textToMidi(words))
s0.n.fn(textToMidi(words))
  .snap('Dmpent%8 | Fmpent%8').sub(36)
s0.e.fn(textToRhythm(words))

s1.set({
  inst: 'sampler',
  bank: 'breaks',
  dur: btms(4),
  snap: 16,
  cut: [1,0],
  i: 1,
})
s1.begin.mod(32).ifelse(
  random(0,1).step(1/8).cache(),
  0,
)
s1.e.every(16).or(fn(textToRhythm(words)))
\`\`\`
`