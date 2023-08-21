import type { Dictionary } from '../types'
import { aliases } from '../data/keymapping'

// remove _ from all params
export const formatEventParams = (params: Dictionary, map: Dictionary) => {    
    return Object.entries(params)
        .filter(([_, value]) => value !== null)
        .reduce((obj, [key, value]) => {
            key = map[key] || aliases[key] || key;
            return {
                ...obj,
                [key.startsWith('_') ? key.substring(1) : key]: value
            }
        }, {});
}

// filter out all params that don't start with _
// remove _ from remaining params
export const formatMutationParams = (params: Dictionary, map: Dictionary, lag: number) => {
    return {
        ...Object.entries(params)
            .filter(([key, value]) => key.startsWith('_') && value !== null && value !== undefined)
            .reduce((obj, [key, value]) => {
                key = map[key] || aliases[key] || key;
                return {
                    ...obj,
                    [key.substring(1)]: value
                }
            }, {}),
        lag: params.lag || params.la || lag
    }
}