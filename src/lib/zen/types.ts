
export type dictionary = { [key: string]: any }

export type stack = {(x: number): number}[]

export type action = { (time: number, delta: number, events: dictionary[], mutations: dictionary[]): void }