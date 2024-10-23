export default `# Instruments
Zen has an internal synth engine, with a range of high-quality instruments and effects, all within your browser. Full documentation for instruments and effects can be found in the docs. This chapter gives a flavour of what’s possible.

## Generic Parameters
Most instruments share a common set of parameters. Envelope parameters are \`a\` (attack), \`d\` (decay), \`s\` (sustain), \`r\` (release). The \`dur\` parameter controls the duration of the note, the \`amp\` parameter controls the amplitude of the note, and the \`vol\` parameter controls the overall volume of the instrument. \`lag\` determines the time in ms it takes for a stream to mutate (see [mutations](/learn/mutations)), whilst \`nudge\` allows you to delay a stream's events by a given amount of time (in ms).

## Synth
An all purpose synth with filters and FM:
\`\`\`js
s0.set({inst:'synth',cut:0,re:0.25,rdecay:0.75,de:0.25,lag:ms(2),locut:0.3})

s0.x.saw()
s0.y.noise()

s0.p.n.set('Dpro%16..?*16|*4').sub(12)
s0.p.mods.random(0.1,1,0.5)
s0.p.dur.noise(0.1,2,0.75).btms()
s0.p._modi.set(s0.x).saw(0.25,0.5)
s0.p._harm.set(s0.y).saw(0.5,3,0.25)

s0.e.every('1?2*16')
s0.m.not(s0.e)
\`\`\`

## Sampler
The sampler takes the name of a sample bank and the index of a file within that directory. To print a list of available sample banks, type \`samples()\` into the editor. See the chapter on [Custom Samples](/learn/custom-samples) to load your own.
\`\`\`js
z.bpm.set(160)

s0.set({inst:1,bank:'breaks',snap:16,dur:ms(1),cut:[0,1,2]})
s0.e.set('1')

s1.set({inst:1,ba:'breaks',snap:16,cut:[0,1],dur:ms(8),loop:1,cutr:ms(0.5),re:0.125,rs:0.1})
s1.x.saw(0,1,1/4)
s1.p.begin.set(s1.x).saw().step(1/8)
s1.p.i.v('0|*3 1')
s1.e.not(s0.e).and($every(16))
\`\`\`

## Granular Synth
Similar to the sampler, the granular synth expects a sample bank and index. Granular synthesis allows you to treat pitch \`n\` and playback speed \`rate\` separately.
\`\`\`js
z.bpm.set(160)

s0.set({inst:'granular',bank:'cpu2',i:2,snap:q,dur:ms(8),cut:[0,1,2],rate:0.5,lag:ms(1/4),vol:0.5,reverb:1,locut:0.25})
s0.p._n.sine(60,72,0,0.25)
s0.p._i.random(0,16,1)
s0.e.set('1|0')
s0.m.every(1)
\`\`\`
`