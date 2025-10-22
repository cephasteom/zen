export default `# Mini-notation
Inspired by [Tidal Cycles](https://tidalcycles.org/), Zen features a mini-notation for expressing patterns. Zen parses a mini-notation \`strings\` into an array, then selects the correct value based on the current time.

## Basic syntax
Create an array of length 16 and fill with 1s:
\`\`\`js
s0.e.set('1*16').print('e') // triggers on every division
\`\`\`

Create an array of length 16 and randomly fill it with 1s and 0s:
\`\`\`js
s0.e.set('1?0*16').print('e')
\`\`\`

Create a sequence:
\`\`\`js
s0.x.set('0..15*16').print('x')
s0.e.set('1*16')
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.x.set('0..15?*16').print('x')
s0.e.set('1*16')
\`\`\`

Alternate between values:
\`\`\`js
s0.x.set('0,1*2').print('x')
s0.e.set('1*16')
\`\`\`

Alternate between values:
\`\`\`js
s0.x.set('0,0.25,0.5,0.75*4').print('x')
s0.y.set('0,0.25,0.5,0.75*16').print('y')
s0.e.set('1*16')
\`\`\`

Notate bars:
\`\`\`js
s0.x.set('0..15*16 | 15..0*16 |').print('x')
s0.e.set('1*16')
\`\`\`

Repeat bars:
\`\`\`js
s0.x.set('0..15*16 |*2 15..0*16 |*3').print('x')
s0.e.set('1*16')
\`\`\`

Stretch bars:
\`\`\`js
s0.x.set('0..15*16 |^3').print('x')
s0.e.set('1*16')
\`\`\`

You can repeat bars, then stretch them, but not the other way around:
\`\`\`js
s0.x.set('0..15?*16 |*2^3').print('x')
s0.e.set('1*16')
\`\`\`

## Euclidean rhythms

[Euclidean rhythms](https://en.wikipedia.org/wiki/Euclidean_rhythm) spread *x* beats over a *y* divisions, as equally as possible.

4 pulses over 16 divisions:
\`\`\`js
s0.x.set('0..15*16').print('x')
s0.e.set('4:16')
\`\`\`

3 pulses over 8 division:
\`\`\`js
s0.x.set('0..15*16').print('x')
s0.e.set('3:8')
\`\`\`

3 over 8, twice per bar:
\`\`\`js
s0.x.set('0..15*16').print('x')
s0.e.set('3:8*2')
\`\`\`

## Note values
Midi note values are notated as \`<root><octave>\`, where the root is a capital letter and the octave is an number.
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,cutr:100})
s0.n.set('C4 E4 G4 B4')
s0.e.sometimes()
\`\`\`

## Chords and scales
Chords and scales are handled identically. Both return an array of note values. Scales were gratefully adapted from Tidal Cycle's [scale library](https://github.com/tidalcycles/Tidal/blob/fcc4c5d53a72dcf2b8f4c00cc1c1b3c75eef172d/src/Sound/Tidal/Scales.hs#L4).

### Chords
Chords are notated as \`<root><triad><extension?>\`, where the root is a capitalised letter, the triad is one of \`ma\`, \`mi\`, \`di\`, \`au\`, \`su\` (major, minor, diminished, augmented, suspended), and the (optional) extension is one of \`6\`, \`7\`, \`#7\`, \`b9\`, \`9\`, \`11\`, \`#11\`, \`13\`, \`#13\`:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.n.set('Cmi7')
s0.e.set('9:16')
\`\`\`

Turn the chord into a sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.n.set('Cmi7..*8')
s0.e.set('9:16')
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.n.set('Cmi7..?*16')
s0.e.set('9:16')
\`\`\`

Specify the length of the chord:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100})
s0.n.set('Cmi7%16..*16')
s0.e.set('1*16')
\`\`\`

A number of Pattern methods handle arrays and can be useful here:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.n.set('Cmi7').at(t())
s0.e.set('1*16')
\`\`\`

### Scales
Scales are notated \`<root><scale>\` and can be treated in the same way:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.n.set('Clyd*16')
s0.e.set('3:8*2')
\`\`\`

Turn the scale into a sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.n.set('Clyd..*16')
s0.e.set('1*16')
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.n.set('Clyd..?*16')
s0.e.set('1*16')
\`\`\`

Specify the length of the scale:
\`\`\`js
s0.set({inst:0,reverb:0.5,cut:0,dur:10,r:100,vol:0.5})
s0.n.set('Clyd%16..?*16')
s0.e.set('1*16')
\`\`\`

Execute \`scales()\` in the editor to print a list of available scales in the console.

## Mini-notation can be used anywhere!
Mini-notation can be used in place of any value in Zen, making it enormously powerful. For example:
\`\`\`js
s0.set({inst:0,reverb:'0.5?0*16',cut:'0?1*16',dur:10,r:100,vol:0.5})
s0.n.set('Clyd%16..?*16')
s0.e.set('1*16')
\`\`\`
`