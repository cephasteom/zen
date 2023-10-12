import osc from 'osc'
const channel = new BroadcastChannel('zen')

const urlParams = new URLSearchParams(window.location.search);
export const useOsc = urlParams.has('osc')

export const oscSocket = new osc.WebSocketPort({
    url: "ws://localhost:8080",
    metadata: true
});

let oscSocketIsConnected = false

export function connectOsc() {
    oscSocket.open()
    oscSocket.on("ready", () => {
        channel.postMessage({type: 'success', message: 'Successfully connected to osc backend'})
        oscSocketIsConnected = true
    });
}

export function sendOsc(data: any) {
    if(!useOsc || !oscSocketIsConnected) return
    
    const { time, delta, events, mutations } = data;
    
    // @ts-ignore
    events.forEach(({id, eparams}) => {
        const [_, i] = id.split('')
        oscSocket.send({address: `/zen/${+i+1}/volume`, args: [{type: 'f', value: eparams.vol}]})
        // Object.entries(eparams).forEach(([key, value]) => {
        //     oscSocket.send({address: `/zen/${+i+1}/${key}`, args: [{type: 'f', value}]})
        // })
    })
    
    // @ts-ignore
    // mutations.forEach(({id, mparams}) => {
    //     const args = formatArgsForOsc(time, mparams)
    //     oscSocket.send({address: `/zen/${id}/mutation`, args})
    // })   
}

function formatArgsForOsc(time: number, params: any) {
    return Object.entries({time, ...params}).map(([key, value]) => {
        return [
            {type: 's', value: key},
            {type: 'f', value} 
        ]
    }).flat();
}