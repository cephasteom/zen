import seedRandom from 'seedrandom'
import { writable } from 'svelte/store';
export const seedValue = writable('')
export const seed = (str: string) => {
    seedValue.set(str)
}

seedValue.subscribe(value => {
    if(!seed) return
    // generate 256 random numbers from seed
    const rng = seedRandom(value)
    const arr = Array(256).fill(0).map(_ => rng())
    // store in localStorage
    localStorage.setItem('z.seed', JSON.stringify(arr))
})