export default `# Streams
Zen is organised into Streams, which refer to different musical layers. Streams are represented by the letter \`s\` and an index, as in \`s0\`, \`s1\`, \`s2\` ... \`s63\`. Think of them as separate tracks on a mixing desk, each track with its own instruments and effects. A Stream is an instance of a [Stream class](/docs/classes#stream). 

A Stream is just an object that returns a Pattern for each property. For example, \`s0.n\` returns a Pattern that can be used to set the note values for stream 0, \`s0.reverb\` returns a Pattern that can be used to set the reverb value for stream 0, and so on. Even, \`s0.banana\` will return a Pattern, though it's unlikely that you'll find a banana parameter in your synth engine.

Properties can be set directly, as above, or using the \`.set()\` method, which accepts an object literal with key/value pairs. For example, these two examples are equivalent:
\`\`\`js
s0.inst.set('synth')
s0.n.saw(0,32,2).add(48)
s0.e.sometimes()
\`\`\`

\`\`\`js
s0.set({inst: 'synth', n: saw(0,32,2).add(48), e: sometimes()})
\`\`\`

The properties you set depend on the parameters of the instruments and effect you are using. For example, if you are using the sampler, you'll want to set a sample bank and index: 
\`\`\`js
s0.set({inst: 'sampler', bank: 'bd808 sd808', e: sometimes().cache(16,4)})
s0.i.random(1,15).step(1).cache(16,4)
\`\`\`

You can find a full list of instruments and their parameters in the [Synths docs](/docs/synths), and a full list of effects and their parameters in the [Effects docs](/docs/fx).

Here are some special stream properties.

## .e
\`.e\` stands for event and is used to trigger the stream. If \`.e\` is set to 0 no event is triggered. If \`.e\` is greater than 0, an event is triggered. Consequently, there are many Pattern methods that simply return 1s and 0s.

Here are some different ways you could trigger a stream. Try replacing the final line of the previous example with one of the following:
\`\`\`js
s0.e.every(4)
\`\`\`

\`\`\`js
s0.e.every(4).or(every(3))
\`\`\`

\`\`\`js
s0.e.sine(0,1).step(1)
\`\`\`

\`\`\`js
s0.e.set('1?0*16')
\`\`\`

\`\`\`js
s0.e.set('3:8*2')
\`\`\`

\`\`\`js
s0.set({e: '1?0*16'})
\`\`\`

## .m
\`.e\` stands for mutation and is used to modulate parameters whilst a synth is playing. We'll cover this in depth in a later chapter. It works the same way as \`.e\`, so you can use the same methods to set it. For example, \`s0.m.every(4)\` will modulate the stream every 4 beats.

## .cut
Cut is a special parameter that allows you to cut short active events in any stream. It accepts an integer or array of integers which reference the index of a stream. For example, \`s0.set({cut:0})\` will cut any active events in stream 0 short. \`s0.set({cut:[1,2]})\` will cut any active events in streams 1 and 2 short. By default, cut fades out the event over 5ms. You can set the fade time using the \`cutr\` parameter. For example, \`s0.set({cut:0,cutr:500})\` will cut any active events in stream 0 short over 500ms. 

## .solo and .mute
Solo and mute are used to solo or mute a stream. For example, \`s0.solo.set(1)\` will solo stream 0. \`s0.mute.set(1)\` will mute stream 0.

## .level
Level is a special parameter that allows you to control the level of the track used by the Stream. It accepts values between 0 and 1. For example, \`s0.set({level:0.5})\` will set the level of stream 0 to 0.5. Think of it as the final fader on a mixing desk channel strip.

## .out
Streams are always stereo. By default, all streams are routed to the first two channels of your output device. You can route streams using the \`out\` parameter. For example, \`s0.set({out: 2})\` will route stream 0 to channels 2 and 3. Here's a shorthand way of spreading your streams across the outputs of your audio interface:
\`\`\`js
streams.slice(0,8).map((stream,i) => stream.ps({out: i*2}))
\`\`\`
`