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
    if(collab) isCollaborating.set(true);
}
initCollaborate();
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