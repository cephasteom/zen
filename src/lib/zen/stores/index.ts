import seedRandom from 'seedrandom'
import { Noise } from 'noisejs'
import { writable } from 'svelte/store';

const seedValue = writable('')
export const noise = writable(new Noise(Math.random()))

export const seed = (str: string) => {
    seedValue.set(str)
}

export const randomSequence = writable<number[]>([])

seedValue.subscribe(value => {
    if(!value) return
    
    // generate 256 random numbers from seed
    const rng = seedRandom(value)
    const arr = Array(256).fill(0).map(_ => rng())
    randomSequence.set(arr)

    // update noise generator
    noise.set(new Noise(rng()))
})


