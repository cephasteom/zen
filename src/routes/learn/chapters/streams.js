export default `# Streams
Zen is organised into Streams, which refer to different musical layers. Streams are represented by the letter \`s\` and an index, as in \`s0\`, \`s1\`, \`s2\` ... \`s63\`. Think of them as separate tracks on a mixing desk, each track with its own instruments and effects. A Stream is an instance of a [Stream class](/docs/classes#stream). The methods and properties you’ll use the most are:
- \`.set()\`
- \`.p\`
- \`.e\`

## .set()
The \`.set()\` method is used to set parameters that remain constant. It accepts an object literal: a list of key/value pairs. For example, \`s0.set({inst:’synth’,vol:0.5})\` tells stream 0 to use the synth instrument at half volume. 

## .p
The \`.p\` property is used to set parameters that should change over time. These are written, for example, as \`s0.p.vol\`, or \`s0.p.amp\`, or even \`s0.p.banana\`. Zen doesn’t care what parameter names you use here, invalid parameters are simply ignored by the synth engine. All parameters are instances of the [Pattern class](/docs/classes#pattern), covered in the previous chapter.

Here’s an example of setting parameters using the \`.p\` property:
\`\`\`js
s0.set({inst:0,cut:0,mods:0.1,reverb:0.5})
s0.p.n.saw(0,32,2).add(48)
s0.p.modi.sine(0,4,0,0.5)
s0.p.harm.tri(1,2)
s0.p.pan.noise()
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

kick.set({inst:1,cut:snare.i})
snare.set({inst:2,cut:kick.i})
\`\`\`

### Track
By default, each Stream sits on its own track, controlling a separate channel strip containing instruments and fx. These are created as you use them, meaning most tracks, and their associated instruments and fx, are dormant. As soon as you use more than 8 streams, particularly if you use reverb on each, things get a little expensive, especially when running Zen in the browser. To save on CPU, you can point multiple Streams at the same track, using the \`track\` parameter. For example, \`s0.set({track:0})\` and \`s1.set({track:0})\` will both play on track 0, sharing their instruments and fx.

Listen to the following example then comment out the track parameter:
\`\`\`js
z.set({
  in:0,dur:ms(4),re:0.5,rde:0.5,v:1,r:1000,co:1000,res:0.1,ra:1,
  track:0, // comment out this line to hear the difference
});
  
[s0,s1,s2,s3,s4,s5,s6,s7]
  .map(st => st
    .set({vol:0.25})
    .p._n.set('Clyd%16..?*16')._
    .p._harm.saw(0.5,1.5,0.25)._
    .e.set('1*16')._
    .m.set('1*16')
  )
\`\`\`
Without the track parameter, we hear 8 synths with 8 reverbs. With the track parameter set to the same value, all streams control the same synth and reverb, saving on CPU.
`