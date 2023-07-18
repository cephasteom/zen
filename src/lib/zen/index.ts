import { start, Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import { Zen } from './classes/Zen';
import { Stream } from './classes/Stream';
import { createCount } from './utils/utils';
import type { action } from './types';
import keymap from './data/keymapping'


export const lastCode = writable('');
export const code = writable('');
export const setCode = (str: string) => {
    code.set(str)
};

export const actions = writable<action[]>([])
export const addAction = (cb: action) => {
    actions.update((arr: action[]) => [...arr, cb])
}

export const errorActions = writable<{(message: string) : void}[]>([])
export const addErrorAction = (cb: (message: string) => void) => {
    errorActions.update((arr: {(message: string) : void}[]) => [...arr, cb])
}

let counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
export const z = new Zen();
export const streams: Stream[] = Array(8).fill(0).map((_, i) => new Stream('s' + i))

// Main Zen loop
const loop = new Loop(time => {
    // increment global time
    let t = counter()

    streams.forEach(stream => stream.reset())
    z.reset(t)

    // global variables
    let { q, s, c } = z
    
    // evaluate the user's code, using fallback if it fails
    try {
        const [ s0, s1, s2, s3, s4, s5, s6, s7 ] = streams;
        const map = keymap
        const thisCode = !(t%z.update) ? get(code) : get(lastCode) // only eval code on the beat
        eval(thisCode)
        lastCode.set(thisCode)
    } catch (e: any) {
        const [ s0, s1, s2, s3, s4, s5, s6, s7 ] = streams;
        get(errorActions).forEach(cb => cb(e.message))
        eval(get(lastCode))
    }
    
    // reassign global variables in case the user has changed them
    t = z.getTime()
    s = z.s
    q = z.q
    c = z.c
    const bpm = z.getBpm()

    // update loop and transport
    loop.interval = `${q}n`
    Transport.bpm.setValueAtTime(bpm, time)

    // compile events and mutations
    const compiled = streams.map(stream => stream.get(t, q, s, bpm))
    const soloed = compiled.filter(({solo}) => solo)
    const data = soloed.length ? soloed : compiled
    const events = data.filter(({e}) => e)
    const mutations = data.filter(({m}) => m)

    // call actions
    const delta = (time - immediate())
    const args = { time, delta, t, s, q, c, events, mutations }
    get(actions).forEach((cb: action) => cb(args))

}, `${z.q}n`).start(0)

export const play = () => {
    Transport.start('+0.1')
}

let stops = 0;
export const stop = () => {
    stops++;
    Transport.stop(immediate())
    // reset counter if stopped twice
    !(stops%2) && (counter = createCount(0))
}

export async function startAudio() {
    await start()    
    console.log('started audio')
    window.removeEventListener('keydown', startAudio)
    window.removeEventListener('click', startAudio)
    window.removeEventListener('touchstart', startAudio)
}