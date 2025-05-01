import { SalatRepl } from '@kabelsalat/web'

export const ks = new SalatRepl()
let isRunning = false
export const runCode = (() => {
    if (isRunning) return
    const code = `saw([55,110,220,330]).lpf( sine(.25).range(.3,.7) )
    .mix(2)
    .mul(impulse(4).perc(.1).lag(.05))
    .add(x=>x.delay(saw(.01).range(.005,.02)).mul(.9))
    .add(x=>x.delay(.3).mul(.7))
    .fold().mul(.6)
    .out()`
    ks.run( code )
    isRunning = true
})