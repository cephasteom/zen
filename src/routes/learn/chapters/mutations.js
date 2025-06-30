export default `# Mutations
Zen allows you to modulate the parameters of all active events within a stream. The \`.m\` parameter stands for mutation and is an instance of the [Pattern class](/docs/classes#pattern). As with events, when the Pattern returns a value greater than 0, a mutation is triggered. Parameters to be mutated should be prefixed with \`_\`.
\`\`\`js
s0.set({inst:'synth',cut:0,re:0.25,rdecay:0.75,de:0.25,lag:ms(2),locut:0.3,vol:0.5})
s0._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)
\`\`\`
In the example above, try adding and removing the \`_\` prefix from the n parameter and comparing the two patterns. 

Finally, the \`lag\` parameter determines how many milliseconds it should take for a mutation to modulate from one parameter to the next. This can be useful for creating smooth transitions between values.
`