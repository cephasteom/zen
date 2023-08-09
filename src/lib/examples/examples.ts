export const examples = {
    "Dorian Noodles": 
`// Press Shift + Enter to run your code. 
// Press Esc to stop.
z.s = (t%q)+4
z.q = z.s
z.set({inst: 'synth', reverb: 0.75, vol: 0.25, lag: 1000, s: 0.25, r: 2000, cut: [0,1,2,3]})
z.p.n.scales('d-dorian', 16)
z.p.dur.saw(0.25,4,1/32).btms()
z.p.hicut.saw(0.5,0,1/32)

s0.p.n.use(z.p.n).add(12)
s0.px._modi.range().mul((c%16)).div(4)
s0.x.noise(0,s)
s0.e.every((c%4) + 3)
s0.m.every(2)

s1.set({cut: 1, rsize: 0.75})
s1.p.n.use(z.p.n)
s1.px._modi.range()
s1.py._harm.range(1,2,0.25)
s1.x.eval(s0.x).subr(s)
s1.y.noise(0, s-1)
s1.e.use(s0.e).neq(1)
s0.m.set(1)

s2.set({reverb: 1})
s2.p.n.use(z.p.n).add(12)
s2.xyz.set([t,s/3])
s2.e.every(4)
s2.m.every(6)

s3.set({rsize: 1, s: 0.1, dtime: 500, dfb: 0.75})
s3.p.delay.saw(0,1,0,0.125)
s3.p._n.use(z.p.n).add(19)
s2.xyz.set([s-t, s*(2/3)])
s3.e.eval(s2.e)
s3.m.every(4)`
}