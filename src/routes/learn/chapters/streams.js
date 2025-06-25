export default `# Streams
Zen is organised into Streams, which refer to different musical layers. Streams are represented by the letter \`s\` and an index, as in \`s0\`, \`s1\`, \`s2\` ... \`s63\`. Think of them as separate tracks on a mixing desk, each track with its own instruments and effects. A Stream is an instance of a [Stream class](/docs/classes#stream). The methods and properties you'll use the most are:
- \`.set()\`
- \`.e\`

## .set()
The \`.set()\` method is used to set musical parameters. It accepts an object literal: a list of key/value pairs. For example, \`s0.set({inst:'synth',vol:0.5})\` tells stream 0 to use the synth instrument at half volume. You can also use \`.ps()\` or \`.params()\` as aliases if these make more sense to you. 

Zen doesn't care what parameter names you use here, invalid parameters are simply ignored by the synth engine.

You can set parameter using constant values or using patterns to change values over time. Here's an example of some ways you can set parameters:
\`\`\`js
s0.set({
  // constant values
  inst:0,cut:0,mods:0.1,reverb:0.5, 
  // patterns
  n: saw(0,32,2).add(48),
  modi: sine(0,4,0,0.5),
  harm: tri(1,2)
  pan: noise()
})
s0.e.set(1)
\`\`\`

## .e
\`.e\` stands for event and is used to trigger the stream. It is also an instance of a Pattern. If \`.e\` is set to 0 no event is triggered. If \`.e\` is greater than 0, an event is triggered. Consequently, there are many Pattern methods that simply return 1s and 0s.

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

## .p
The \`.p\` property is a alternative way of setting musical parameters and can be ignored if it muddies the waters for you.

Here's an example of setting parameters using the \`.p\` property:
\`\`\`js
// set musical parameters using .params()
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
// or set the individual parameters using .p
s0.p.n.saw(0,32,2).add(48)
s0.p.modi.sine(0,4,0,0.5)
s0.p.harm.tri(1,2)
s0.p.pan.noise()
s0.e.set(1)
\`\`\`

## Additional Features
A few extras before moving on. If you're just trying to get a sense of what Zen can do, you can skip this section for now.

### Cut
Cut is a special parameter that allows you to cut active events in any stream short. It accepts an integer or array of integers which reference the index of a stream. For example, \`s0.set({cut:1})\` will cut any active events in stream 0 short. \`s0.set({cut:[1,2]})\` will cut any active events in streams 1 and 2 short. By default, cut fades out the event over 5ms. You can set the fade time using the \`cutr\` parameter. For example, \`s0.set({cut:1,cutr:500})\` will cut any active events in stream 0 short over 500ms. 

### Solo and Mute
Solo and mute are both instances of a Pattern. They are used to solo or mute a stream. For example, \`s0.solo.set(1)\` will solo stream 0. \`s0.mute.set(1)\` will mute stream 0.

They can be patterned in the usual way, for example, \`s0.solo.set('1?0*16')\` will randomly solo stream 0. 

### Level
Level is a special parameter that allows you to control the level of the track used by the Stream. It accepts a float between 0 and 1. For example, \`s0.set({level:0.5})\` will set the level of stream 0 to 0.5. Think of it as the fader on a mixing desk channel strip.

### I
Use \`s0.i\` to access the index of the Stream. This is useful when you want to reference the Stream elsewhere:
\`\`\`js
let kick = s0
let snare = s1

kick.ps({inst:1,cut:snare.i})
snare.ps({inst:2,cut:kick.i})
\`\`\`

### Out
Streams are always stereo. By default, all streams are routed to the first two channels of your output device. You can route streams using the \`out\` parameter. For example, \`s0.set({out: 2})\` will route stream 0 to channels 2 and 3. Here's a shorthand way of spreading your streams across the outputs of your audio interface:
\`\`\`js
streams.slice(0,8).map((stream,i) => stream.ps({out: i*2}))
\`\`\`
`