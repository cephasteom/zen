import { pipe } from '../utils/utils'
import { parseQasm } from './qasm'

// TODO: mute and solo
export const parseCode = (code: string) => {
    const result = pipe(
        parseQasm,
    )(code)

    return result
}