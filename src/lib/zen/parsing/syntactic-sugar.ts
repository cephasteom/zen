import { pipe } from '../utils/utils'

export const parseCode = (code: string) => {
    return pipe(
        // replace p.banana() with p.banana.set()
        (code: string) => code.replace(/p\.(\w+)\(/g, 'p.$1.set('),
        (code: string) => code.replace(/px\.(\w+)\(/g, 'px.$1.set('),
        (code: string) => code.replace(/py\.(\w+)/g, 'py.$1.set('),
        (code: string) => code.replace(/pz\.(\w+)/g, 'pz.$1.set('),
    )(code)
}