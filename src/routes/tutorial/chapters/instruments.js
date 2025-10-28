export default `
# Instruments

Zen comes with a variety of built-in instruments. Run \`instruments()\` to see a list of available instruments. You can set the instrument of a Stream using the \`inst\` property:
\`\`\`js
s0.set({inst: 'sampler'}) // use the name of the instrument
s0.set({inst: 0}) // or use the index
\`\`\`

For a full list of instrument properties, see the help documentation (\`cmd + h\`)

## Shared Properties
All instruments use the following properties:
- \`n\`: note or frequency
- \`amp\`: amplitude (volume)
- \`dur\`: duration (in ms)
- \`cut\`: cut other notes when a new note is triggered (index of stream)
- \`a\`: attack time (in ms)
- \`d\`: decay time (in ms)
- \`s\`: sustain level (0 to 1)
- \`r\`: release time (in ms)
- \`pan\`: stereo panning (-1 to 1)

## Synth
The \`synth\` instrument is a simple FM synthesizer. Here are some example settings:
\`\`\`js
s0.set({inst: 'synth', cut: 0})
s0.n.set('Ddor%16..*16')
s0.modi.sine(0.5)
s0.harm.random(0.5,11).step(0.5)
s0.e.every(2)
\`\`\`

## Sampler
The \`sampler\` instrument plays back audio samples. To see the available samples, run \`samples()\`.

You can load your own samples or use the built-in ones. Here are some example settings:

\`\`\`js
s0.set({inst: 'sampler', bank: 'bd808', cut: 0})
s0.n.set('Ddor%16..?*16')
s0.i.random(0,16).step(1)
s0.e.every(1)
\`\`\`

## Granular
The \`granular\` instrument plays back audio samples using granular synthesis. Here are some example settings:
\`\`\`js
s0.set({inst: 2, bank: 'breaks', snap: 16, dur:btms(4), cut: 0})
s0.begin.saw(.25)
s0.n.set('Ddor%16..?*16')
s0.e.every(2)
\`\`\`
`