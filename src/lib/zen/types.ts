
export type dictionary = { [key: string]: any }

export type patternValue = number | number[]

export type stack = {(x: number | patternValue): patternValue}[]

export interface ActionArgs {
    time: number
    delta: number
    events: dictionary[]
    mutations: dictionary[]
    t: number
    c: number
    q: number
    s: number
}
export type action = { (input: ActionArgs): void }
