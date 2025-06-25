export const example = `s0.set({
  inst:0,cut:0,reverb:.5,delay:.25,vol:.5,modi:1.25,mods:0.1,
  n: set('Cpro%16..*16 | Cpro%16..?*16').sub(12),
  s: noise(0.05,0.5,0.25)
})
s0.e.every(4).or(every(3))
`

// export const example = ''