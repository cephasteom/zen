export const examples = {
    "dorian noodles": 
`z.s = (t%q)+4
z.q = z.s

s0.set({inst: 'synth', reverb: 0.75, vol: 0.25, lag: 1000, s: 0.25, r: 2000, cut: 1, harm: 1.01})
s0.p.n.scales('d-dorian', 16).add(12)
s0.px._modi.range().mul((c%16)).div(4)
s0.x.noise(0,s)
s0.e.every((c%4) + 3)
s0.m.every(2)

s1.set({inst: 'synth', reverb: 1, cut: 1, vol: 0.25, rsize: 0.75, lag: 1000})
s1.p.n.scales('d-dorian', 8)
s1.px._modi.range()
s1.py._harm.range(1,2,0.25)
s1.x.eval(s0.x).$take(s)
s1.y.noise(0, s-1)
s1.e.use(s0.e).neq(1)
s0.m.set(1)

s2.set({inst: 'synth', vol: 0.25, reverb: 1})
s2.p._n.scales('d-dorian', 16).add(12)
s2.y.set(s/3)
s2.x.set(t)
s2.e.every(4)
s2.m.every(6)

s3.set({inst: 'synth', lag: 1000, vol: 1/8, reverb: 1, rsize: 1, s: 0.1, dtime: 500, dfb: 0.75})
s3.p.delay.saw(0,1,0,0.125)
s3.p._n.eval(s2.p._n).add(19)
s3.y.set(s*(2/3))
s2.x.set(s-t)
s3.e.eval(s2.e)
s3.m.every(4)
    `,    
}