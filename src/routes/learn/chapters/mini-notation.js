// TODO: grouping

export default `# Mini-notation
Inspired by the [Tidal Cycles](https://tidalcycles.org/) pattern language, and guided by this [excellent tutorial](http://alicelab.world/workshop_nime_2017/) from the writers of [Gibber](https://gibber.cc/), Zen includes a mini-notation for expressing patterns. Under the hood, Zen parses this mini-language into arrays of values, then uses the current time to get the right value.

## Basic syntax
Create an array of length 16, fill with 1s, then use it to trigger a stream:
\`\`\`js
s0.e.set('1*16') // triggers on every division
\`\`\`

Create an array of length 16 and randomly fill it with 1s and 0s:
\`\`\`js
s0.e.set('1?0*16') // trigger randomly, but repeat the pattern every bar
\`\`\`

Create a sequence of values:
\`\`\`js
s0.x.set('0..15*16').div(16)
s0.e.set('1*16')
\`\`\`

Randomly choose from a sequence:
\`\`\`js
s0.x.set('0..15?*16').div(16)
s0.e.set('1*16')
\`\`\`

Alternate between values:
\`\`\`js
s0.x.set('0,0.5*2')
s0.e.set('1*16')
\`\`\`

Alternate between values:
\`\`\`js
s0.x.set('0,0.25,0.5,0.75*4')
s0.y.set('0,0.25,0.5,0.75*16')
s0.e.set('1*16')
\`\`\`

Notate bars:
\`\`\`js
s0.x.set('0..15*16 | 15..0*16 |').div(16)
s0.e.set('1*16')
\`\`\`

Repeat bars:
\`\`\`js
s0.x.set('0..15*16 |*2 15..0*16 |*3').div(16)
s0.e.set('1*16')
\`\`\`

Stretch bars:
\`\`\`js
s0.x.set('0..15*16 |^3')
s0.e.set('1*16')
\`\`\`

You can repeat bars, then stretch them, but not the other way around:
\`\`\`js
s0.x.set('0..15?*16 |*2^3')
s0.e.set('1*16')
\`\`\`

## Euclidean rhythms

[Euclidean rhythms](https://en.wikipedia.org/wiki/Euclidean_rhythm) are created by spreading beats over a given number of divisions, as equally as possible.

4 pulses over 16 divisions:
\`\`\`js
s0.x.set('0..15*16')
s0.e.set('4:16')
\`\`\`

3 pulses over 8 division:
\`\`\`js
s0.x.set('0..15*16')
s0.e.set('3:8')
\`\`\`

3 over 8, twice per bar:
\`\`\`js
s0.x.set('0..15*16')
s0.e.set('3:8*2')
\`\`\`

## Note values
Midi note values are notated as \`<root><octave>\`, where the root is a capital letter and the octave is an integer.
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,cutr:100})
s0.x.set('0..15?*16 |*4').div(16)
s0.p.n.set(s0.x).set('C4 E4 G4 B4') // use the x position to control the note number
s0.e.set('9:16')
\`\`\`

## Chords and scales
Chords and scales both return an array of note values. Scales were adapted from Tidal Cycle's [scale library](https://github.com/tidalcycles/Tidal/blob/fcc4c5d53a72dcf2b8f4c00cc1c1b3c75eef172d/src/Sound/Tidal/Scales.hs#L4). Many thanks!

Chords are notated as \`<root><triad><extension?>\`, where the root is a capitalised letter, the triad is one of \`ma\`, \`mi\`, \`di\`, \`au\`, \`su\` (major, minor, diminished, augmented, suspended), and the (optional) extension is one of \`6\`, \`7\`, \`#7\`, \`b9\`, \`9\`, \`11\`, \`#11\`, \`13\`, \`#13\`:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.p.n.set('Cmi7')
s0.e.set('9:16')
\`\`\`

Turn the chord into a sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.p.n.set('Cmi7..*8')
s0.e.set('9:16')
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.p.n.set('Cmi7..?*16')
s0.e.set('9:16')
\`\`\`

Specify the length of the chord:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.p.n.set('Cmi7%8..*16')
s0.e.set('1*16')
\`\`\`

A number of Pattern methods handle arrays and can be useful here:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.p.n.set('Cmi7*16').inv('0..8?*16|*4')
s0.e.set('1*16')
\`\`\`

Scales are notated <root><scale> and can be treated in the same way:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.p.n.set('Clyd*16')
s0.e.set('1 1 1 1')
\`\`\`

Turn the scale into a sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.p.n.set('Clyd..*16')
s0.e.set('1*16')
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.p.n.set('Clyd..?*16')
s0.e.set('1*16')
\`\`\`

Specify the length of the scale:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.p.n.set('Clyd%16..?*16')
s0.e.set('1*16')
\`\`\`

Execute \`scales()\` in the editor to print a list of available scales in the console.

## Mini-notation can be used anywhere!
Mini-notation can be used in place of any value in Zen, making it enormously powerful. For example:
\`\`\`js
s0.set({inst:0,reverb:'0.5?0*16',cut:'0?1*16',dur:10,r:100,vol:0.5})
s0.p.n.set('Clyd%16..?*16')
s0.e.set('1*16')
\`\`\`
`