import { generateRandomId } from '$lib/zen/utils/utils';
import { writable } from 'svelte/store';

/* Collaborative Editing */
export const isCollaborating = writable(false);
export const toggleCollaborate = () => isCollaborating.update(c => {
    const collab = !c;
    localStorage.setItem('z.collaborate', collab ? 'true' : '');
    return collab;
})
function initCollaborate() {
    if(typeof localStorage === 'undefined') return
    const collab = localStorage.getItem('z.collaborate');
    if(collab) {
        isCollaborating.set(true);
    }
}
// initCollaborate();
isCollaborating.subscribe(collab => {
    if(typeof localStorage === 'undefined') return
    localStorage.setItem('z.collaborate', collab ? 'true' : '');
})

export const meetingId = writable('');
export const setMeetingId = (id: string) => meetingId.set(id);
function initMeetingId() {
    if(typeof localStorage === 'undefined') return
    const id = localStorage.getItem('z.meetingId');
    meetingId.set(id ? id : generateRandomId());
}
initMeetingId();
meetingId.subscribe(id => {
    if(typeof localStorage === 'undefined') return
    localStorage.setItem('z.meetingId', id);
})

export const rtcOptions = {
    signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
    ],
    peerOpts: {
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                // TURN server if you have one:
                // { urls: 'turn:your.turn.server:3478', username: 'user', credential: 'pass' }
            ]
        }
    }
}