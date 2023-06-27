export function handleEvent(time: number, id: string, params: any) {
    params.midi && handleMidi(time, id, params);
    console.log('event', time, id, params)
}

export function handleMutation(time: number, id: string, params: any) {
    params.midi && handleMidi(time, id, params);
    const mutable = Object.entries(params)
        .filter(([key]) => key.startsWith('_'))
        .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
        }), {});

    console.log('mutation', time, id, mutable)
}

export function handleMidi(time: number, id: string, params: any) {
    console.log('midi', time, id, params)
}