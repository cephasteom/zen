export default `# Getting Started
Before we get into Zen’s nuts and bolts, simply copy the following example into the editor and press shift + enter. Change some values, comment out a few lines and see if you can work out what each part does. When you’ve finished, press esc to stop playback.

\`\`\`javascript
s0.set({inst:0,reverb:.5,delay:.25,vol:.5,modi:1.25,mods:0.1,lag:1000})
s0._n.set('Cpro%16..*16 | Cpro%16..?*16').sub(12),
s0.s.noise(.25,0.05,0.5)
s0.e.every(4).or(every(3))
s0.m.rarely()
\`\`\`
`