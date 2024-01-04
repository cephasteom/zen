import { pipe } from '../utils/utils'

// TODO: mute and solo
export const parseCode = (code: string) => {
    const result = pipe(
        // replace p.banana() with p.banana.set()
        (code: string) => code.replace(/\.p\.(\w+)\(/g, '.p.$1.set('),
        (code: string) => code.replace(/\.px\.(\w+)\(/g, '.px.$1.set('),
        (code: string) => code.replace(/\.py\.(\w+)\(/g, '.py.$1.set('),
        (code: string) => code.replace(/\.pz\.(\w+)\(/g, '.pz.$1.set('),
        // replace .e() with .e.set()
        (code: string) => code.replace(/\.e\(/g, '.e.set('),
        // replace .m() with .m.set()
        (code: string) => code.replace(/\.m\(/g, '.m.set('),
        // replace .x() with .x.set()
        (code: string) => code.replace(/\.x\(/g, '.x.set('),
        // replace .y() with .y.set()
        (code: string) => code.replace(/\.y\(/g, '.y.set('),
        // replace .z() with .z.set()
        (code: string) => code.replace(/\.z\(/g, '.z.set('),
        // replace s0() etc. with s0.set()
        (code: string) => code.replace(/s(\d+)\(/g, 's$1.set('),
        // replace fx0() etc. with fx0.set()
        (code: string) => code.replace(/fx(\d+)\(/g, 'fx$1.set('),
        // replace z() etc. with z.set()
        (code: string) => code.replace(/z\(/g, 'z.set('),
        // replace z.banana() etc. with z.banana.set()
        (code: string) => code.replace(/z\.(?!set|v)(\w+)\(/g, 'z.$1.set('),

    )(code)

    return result
}