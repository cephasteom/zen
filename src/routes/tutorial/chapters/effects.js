export default `
# Effects

Zen includes a number of high-quality effects and filters that can be applied to individual Streams or FX buses. The name of the effect sets the wet to dry level.

Applied directly to a Stream:
\`\`\`js
s0.set({inst: 0, reverb: 0.5, delay: 0.3})
s0.e.every(4)
\`\`\`

Applied to an FX bus (much more efficient):
\`\`\`js
s0.set({inst: 0, fx0: 0.5})
s0.e.every(4)

fx0.set({reverb: 0.7, delay: 0.4})
fx0.e.set(s0.e)
\`\`\`
`