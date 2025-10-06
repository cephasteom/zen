export default `# Mutations
Whilst many live coding environments only allow you to set parameters before you trigger a voice, Zen allows you to update any parameter, whilst the voice is playing. The \`.m\` parameter stands for mutation. As with events, when the Pattern returns a value greater than 0, a mutation is triggered. Parameters to be mutated should be prefixed with \`_\`.
\`\`\`js
s0.set({inst:'synth',cut:0,re:0.25,rdecay:0.75,de:0.25,lag:ms(2),locut:0.3,vol:0.5})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)
\`\`\`
In the example above, try adding and removing the \`_\` prefix from n.

Finally, \`lag\` determines how many milliseconds it should take to ramp from one value to the next.
`