export default `# Streams
The [Stream class](/docs/classes#stream) represents separate musical layers, written as \`s0\`, \`s1\`, \`s2\` ... \`s63\`. Think of Streams as tracks on a mixing desk, each with its own instruments and effects.

A Stream is just an object that returns a Pattern when you access a property. For example, \`s0.n\` returns a Pattern that can be used to set note values, whereas \`s0.reverb\` returns a Pattern that can be used to set the reverb, and so on. Any key will work: even \`s0.banana\` will return a Pattern, though it's unlikely that it will be useful.

You can set properties directly, as follows:
\`\`\`js
s0.inst.set('synth')
s0.n.saw(2,48,64)
s0.e.sometimes()
\`\`\`

Or you can set multiple properties at once using  the \`.set()\` method. The following example is equivalent to the previous one:
\`\`\`js
s0.set({inst: 'synth', n: saw(2,48,64).add(48), e: sometimes()})
\`\`\`

Keys are mapped to the the instruments and effects in the synth engine. For example, if you are using the sampler, you'll want to set a sample bank and index: 
\`\`\`js
s0.set({inst: 'sampler', bank: 'bd808 sd808'})
s0.i.random(1,15).step(1).cache(16,4)
s0.e.sometimes().cache(16,4)
\`\`\`

You can find a full list of instruments and their parameters in the [Synths docs](/docs/synths), and a full list of effects and their parameters in the [Effects docs](/docs/fx).

Here are some special stream properties.

## .e
\`.e\` triggers events on the stream. If \`.e\` is greater than 0, an event is triggered. There are many Pattern methods that simply return 1s and 0s.

Here are some different ways you can trigger a stream. Try replacing the final line of the previous example with one of the following:
\`\`\`js
s0.e.every(4).print('e')
\`\`\`

\`\`\`js
s0.e.every(4).or(every(3)).print('e')
\`\`\`

\`\`\`js
s0.e.sine().step(1).print('e')
\`\`\`

\`\`\`js
s0.e.set('1?0*16').print('e')
\`\`\`

\`\`\`js
s0.e.set('3:8*2').print('e')
\`\`\`

## .m
\`.m\` *mutates* parameters whilst a synth is playing. We'll cover this in depth in a [later chapter](/learn/mutations). It works in the same way as \`.e\`. The following example mutates the stream every 4 beats.
\`\`\`js
s0.m.every(4).print('m')
\`\`\`

## .cut
Cut is a special parameter that stops notes in the same or other streams when an event is triggered. You can pass one or more numbers referencing the streams to cut. For example, \`s0.set({cut:0})\` will cut notes in stream 0 short. Try commenting out the \`cut\` line in the following example:
\`\`\`js
s0.set({inst:'synth', n:'Ddor%16..*16'})
s0.cut.set(0)
s0.e.sometimes()
\`\`\`

## .solo and .mute
Used to solo or mute a stream.
\`\`\`js
s0.solo.set(1) // solo stream 0
s1.mute.set(1) // mute stream 1
\`\`\`

## .level
Set the level of the stream after all effects and filters. Think of it as the final fader on a mixing desk channel strip. Expects a value between 0 and 1.

## .out
By default, all streams are routed to the first two channels of your output device. You can route streams using the \`out\` parameter. For example, \`s0.set({out: 2})\` will route stream 0 to channels 2 and 3. Streams are always stereo. Here's a shorthand way of spreading your streams across the outputs of your audio interface:
\`\`\`js
streams.slice(0,8).map((stream,i) => stream.ps({out: i*2}))
\`\`\`
`