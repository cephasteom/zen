import seedRandom from 'seedrandom'
import { Noise } from 'noisejs'
import { get, writable } from 'svelte/store';

export const nStreams = writable(32)

export const seedValue = writable('')
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

export const bpm = writable(120)
export const getBpm = () => get(bpm)

export const q = writable(16)
export const getQ = () => get(q)
export const storeQ = (value: number) => q.set(value)

// either 'internal' or MIDI device index
export const clockSource = writable<'internal' | 'midi'>('internal')
export const midiClockDevice = writable<number>(0)
export const activeMidiClock = writable(false)
export const midiClockConfig = writable({
    srcBpm: 120,
    relativeBpm: false
})

export const getClockSource = () => get(clockSource)
export const getMidiClockDevice = () => get(midiClockDevice)
export const getActiveMidiClock = () => get(activeMidiClock)
export const getMidiClockConfig = () => get(midiClockConfig)

export const mode = writable<'division' | 'noteon' | 'noteoff' | 'cc'>('division')
export const midiModeDevice = writable<number>(0)

export const getMode = () => get(mode)
export const getMidiModeDevice = () => get(midiModeDevice)
