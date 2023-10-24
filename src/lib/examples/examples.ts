const example1 = `z.bpm.set(160);

[s0,s1,s2,s3].map((st,i) => st.x.t()._.y.set(s/4 * i))

let sc = 'Cpent%15|Empent%10|Dmpent%12|Gpent%8'
let bass = 'A2|G2|F2|G2'

s0.set({inst:1,bank:'breaks',snap: q,dur:ms(1),cut:[0,1,2]})
s0.e.set('1')

s1.set({inst:1,ba:'breaks',snap:q,cut:[0,1],dur:ms(8),loop:1,cutr:ms(0.5),re:0.125,rs:0.1})
s1.px.begin.v('1|*3 0').$if.saw(0,1,1/32,1/16)._.$else.random(0,0.75,1/16)
s1.px.i.v('0|*3 1')
s1.e.not(s0.e).$and.every('8|*4 4|*4')

s2.set({in:0,v:0.75,cu:2,modi:1.5,harm:0.5})
s2.px.n.set(bass)
s2.e.set('8:16').and('1 1?0*8|*4')

s3.set({inst:0,vol:0.5,cut:3,modi:1.1,harm:2,moda:1,de:0.5,dtime:ms(0.5),reverb:0.5,rsize:0.75,mods:0.1,dcolour:0.25})
s3.px.n.set(sc).at('0..15*16|*4 0..15?*16|*4').sub(12)
.$add.set('3:16').mul(12)
s3.p.pa.noise(0.25,0.75)
s3.p.amp.set('3:8').div(2).add(0.5)
s3.e.set(1)`

const example2 = `s0.set({in:0,reverb:0.5,cut:0,dur:10,r:100,v:0.5})
s0.p.n.set('Clyd%16..?*16')
s0.e.set('1*16')`

const example3 = `s0.set({inst:'synth',cut:0,re:0.25,rdecay:0.75,de:0.25,lag:ms(2),locut:0.3,vol:0.5})
s0.p._n.set('Dpro%16..?*16|*4').sub('0?12*16')
s0.e.every('1?2*16')
s0.m.not(s0.e)`

export const examples = {
    example1,
    example2,
    example3
}