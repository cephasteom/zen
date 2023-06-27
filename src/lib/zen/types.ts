export type stack = {(x: number): number}[]

export type action = { (time: number, delta: number, events: { [key: string]: any }[], mutations: { [key: string]: any }[]): void }