import type { Pattern } from './classes/Pattern'

export type Dictionary = { [key: string]: any }

export type patternValue = number | number[]
export type patternable = patternValue | Pattern | string

export type stack = {(x: number | patternValue): patternValue}[]

export interface ActionArgs {
    time: number
    delta: number
    events: Dictionary[]
    mutations: Dictionary[]
    t: number
    c: number
    q: number
    s: number
    v: Uint8Array
}
export type action = { (input: ActionArgs): void }

export type vector = {x: number, y: number, z: number, colour: number[], weight: number}

export type PatternMethod = keyof Pattern;
