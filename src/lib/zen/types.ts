export type stack = {(x: number): number}[]

export type action = { (time: number, delta: number, params: { [key: string]: any }): void }