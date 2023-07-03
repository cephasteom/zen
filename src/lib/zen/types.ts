
export type dictionary = { [key: string]: any }

export type patternValue = number | number[]

export type stack = {(x: number | patternValue): patternValue}[]

export type action = { (time: number, delta: number, events: dictionary[], mutations: dictionary[]): void }
