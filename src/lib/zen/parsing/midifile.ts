import { memoize } from '../utils/utils'
import { Midi } from '@tonejs/midi'

async function parse(path: string, q: number) {
    const midi = await Midi.fromUrl(path) || []
    const timeSig = midi.header.timeSignatures[0]?.timeSignature[0] || 4
    // @ts-ignore
    const endTick = Math.floor(midi.tracks[0].endOfTrackTicks / 480 / timeSig) * timeSig * 480
    const ticksPerDivision = 480 / (q / 4)
    
    const bars = endTick / 480 / timeSig
    const notes = (midi.tracks[0].notes || []).reduce((groups, note) => ({
        ...groups,
        [(note.ticks/ticksPerDivision)]: [
            // @ts-ignore
            ...(groups[(note.ticks/ticksPerDivision)] || []),
            note.midi
        ]
        // @ts-ignore
        .sort((a, b) => a.midi < b.midi)
    }), {})

    const durs = (midi.tracks[0].notes || []).reduce((groups, note) => ({
        ...groups,
        [(note.ticks/ticksPerDivision)]: Math.max(
            // @ts-ignore
            (groups[(note.ticks/ticksPerDivision)] || 0), 
            Math.floor(note.durationTicks / ticksPerDivision) / timeSig

        )
    }), {})
    
    const events = Object.keys(notes).map(e => +e)

    return {
        bars,
        notes,
        events,
        durs
    }
}

export const parseMidiFile = memoize(parse)