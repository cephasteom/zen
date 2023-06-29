// remove _ from all params
export const formatEventParams = (params: any) => {    
    return Object.entries(params)
        .filter(([_, value]) => value !== null)
        .reduce((obj, [key, value]) => ({
            ...obj,
            [key.startsWith('_') ? key.substring(1) : key]: value
        }), {});
}

// filter out all params that don't start with _
// remove _ from remaining params
export const formatMutationParams = (params: any) => {    
    return Object.entries(params)
        .filter(([key, value]) => key.startsWith('_') && value !== null)
        .reduce((obj, [key, value]) => ({
            ...obj,
            [key.substring(1)]: value
        }), {});
}