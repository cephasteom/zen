export default `
# Streams

Streams are the way we organise our musical layers in Zen. Think of them as separate tracks in a music production software, each with their own instruments and effects.

Streams are stored in variables \`s0\`, \`s1\`, \`s2\`, and so on, up to \`s63\`. 

Each Stream is an \`object\`. When a Stream is triggered, it creates a musical event from all of its properties and sends it to the audio engine.
\`\`\`js
s0.inst.set("synth")
s0.n.set(60)
s0.amp.set(0.5)
s0.reverb.set(0.5)
s0.e.once()

// sends { inst: "synth", n: 60, amp: 0.5, reverb: 0.5 } to the audio engine
\`\`\`

You can also write the same thing more concisely using the \`set\` method with an \`object\`:
\`\`\`js
s0.set({inst: "synth", n: 60, amp: 0.5, reverb: 0.5})
s0.e.once()
\`\`\`

### Challenges
1. Create a Stream that plays a bass sound at note 40 with an amplitude of 0.7 and a reverb of 0.3.
2. Look up the documentation for the synth instrument and see what other properties you can set on a Stream.
3. Look up the documentation for the reverb, delay, and FX channel effects and try adding them to your Stream.
`