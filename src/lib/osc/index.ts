import osc from 'osc'

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
        alert('Successfully connected to osc backend')
        oscSocketIsConnected = true
    });
}