import { start, Loop, Transport, immediate } from 'tone'
import { writable, get } from 'svelte/store';
import { Zen } from './classes/Zen';
import { Stream } from './classes/Stream';
import { Visuals } from './classes/Visuals';
import { createCount } from './utils/utils';
import type { action } from './types';
import { helpers } from './utils/helpers';
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

// Fetch data
let d: any = {}
fetch('http://localhost:5000/data.json')
    .then(res => res.json())
    .then(json => {
        if(!json) return
        console.log('Loaded data from ' + 'http://localhost:5000/data.json')
        d = json
    })
    .catch(_ => console.log('No data available at ' + 'http://localhost:5000/data.json'))

let counter = createCount(0);

// initialise Zen and Streams within the scope of the loop
const z = new Zen();
const streams: Stream[] = Array(8).fill(0).map((_, i) => new Stream('s' + i))
const v = new Visuals(16)
let bpm = 120

// helper functions and constants
const { bts: initBts, btms: initBtms, clamp } = helpers;
const { abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2 } = Math;

// Main application loop
const loop = new Loop(time => {
    let t = counter()

    streams.forEach(stream => stream.reset())
    z.reset()
    z.resetGlobals(t)

    // global variables
    let { q, s, c } = z
    const bts = initBts(bpm)
    const btms = initBtms(bpm)
    const ms = btms
    v.resize(s)
    v.reset()
    
    // evaluate the user's code, using fallback if it fails
    const [ s0, s1, s2, s3, s4, s5, s6, s7 ] = streams;
    const map = keymap
    try {
        // prevent unused variable errors
        [bts, btms, ms, clamp];
        [abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2];
        [s0, s1, s2, s3, s4, s5, s6, s7]; map; d;
        const thisCode = !(t%z.update) ? get(code) : get(lastCode) // only eval code on the beat
        eval(thisCode)
        lastCode.set(thisCode)
    } catch (e: any) {
        get(errorActions).forEach(cb => cb(e.message))
        eval(get(lastCode))
    }
    
    // reassign global variables in case the user has changed them
    t = z.getTime()
    s = z.s
    q = z.q
    c = z.c

    // update loop and transport
    loop.interval = `${q}n`
    const newBpm = z.getBpm()
    if(newBpm !== bpm) {
        Transport.bpm.setValueAtTime(newBpm, time)
        bpm = newBpm
    }

    // compile parameters, events and mutations
    const compiled = streams.map(stream => stream.get(t, q, s, bpm, z))
    const soloed = compiled.filter(({solo}) => solo)
    const result = soloed.length ? soloed : compiled
    const events = result.filter(({e}) => e)
    const mutations = result.filter(({m}) => m)
    v.setPositions(events.map(({x,y}) => ({x,y})), true)
    v.setPositions(mutations.map(({x,y}) => ({x,y})), false)

    // call actions
    const delta = (time - immediate())
    const args = { time, delta, t, s, q, c, events, mutations, v: v.get() }
    get(actions).forEach((cb: action) => cb(args))

}, `${z.q}n`).start(0)

export const play = () => Transport.start('+0.1')

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