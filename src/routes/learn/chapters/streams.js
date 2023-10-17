export default `# Streams
Zen is organised into Streams, which refer to different musical layers. Streams are represented by the letter \`s\` and an index, as in \`s0\`, \`s1\`, \`s2\` ... \`s63\` Think of them as separate tracks on a mixing desk, each track with its own instruments and effects. A Stream is an instance of a [Stream class](/docs/classes#stream). The methods and properties you’ll use the most are:
- \`.set()\`
- \`.p\`
- \`.e\`

## .set()
The \`.set()\` method is used to set parameters that remain constant. It accepts an object literal: a list of key/value pairs. For example, \`s0.set({inst:’synth’,vol:0.5})\` tells stream 0 to use the synth instrument at half volume. 

## .p
The \`.p\` property is used to set parameters that should change over time. These are written, for example, as \`s0.p.vol\`, or \`s0.p.amp\`, or even \`s0.p.banana\`. Zen doesn’t care what parameter names you use here, invalid parameters are simply ignored by the synth engine. All parameters are instances of the [Pattern class](/docs/classes#pattern), which has a plethora of methods for generating interesting patterns. We’ll learn more about these in the following chapter.

For now, here’s an example of setting parameters using the \`.p\` property:
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
s0.e.every(4).$or.every(3)
\`\`\`

\`\`\`js
s0.e.sine(0,1,1)
\`\`\`

\`\`\`js
s0.e.set('1?0*16')
\`\`\`

\`\`\`js
s0.e.set('3:8*2')
\`\`\`
We’ll explore Patterns in the next chapter.

## Additional features
### Track
A few extras before moving on. By default, each Stream sits on its own track, and controls a separate channel strip of containing instruments and fx. These are instantiated as you use them, meaning most tracks are dormant. As soon as you use more than 8 streams, particularly if you use reverb on each, things get a little expensive, especially when running Zen in the browser. To save on CPU, you can point multiple Streams at the same track, using the \`track\` parameter. For example, \`s0.set({track:0})\` and \`s1.set({track:0})\` will both play on track 0, sharing instruments and fx.

Listen to the following example then comment out the track parameter:
\`\`\`js
z.v({
    in:0,du:ms(4),re:0.5,rde:0.5,v:1,r:1000,co:1000,res:0.1,ra:1,
    track:0, // comment out this line to hear the difference
  });
  
  [s0,s1,s2,s3,s4,s5,s6,s7]
    .map((st,i) => st
      .v({v:0.25})
      .p._n.v('Clyd%16..?*16')._
      .p._harm.saw(0.5,1.5,0.25)._
      .e.v('1*16')._
      .m.v('1*16')
    )
\`\`\`
Without the track parameter, we hear 8 synths with 8 reverbs. With the track parameter set to the same value, all streams control the same synth and reverb, saving on CPU.

### Cut
Cut is a special parameter that allows you to cut active events in any stream short. It accepts an integer or array of integers which reference the index of a stream. For example, \`s0.set({cut:1})\` will cut any active events in stream 0 short. \`s0.set({cut:[1,2]})\` will cut any active events in streams 1 and 2 short. By default, cut fades out the event over 5ms. You can set the fade time using the \`cutr\` parameter. For example, \`s0.set({cut:1,cutr:500})\` will cut any active events in stream 0 short over 500ms. 
`