import { writable, derived, get } from 'svelte/store';
import { editorValue } from './zen';

export const presets = writable({} as {[key: string]: string | null})

export const activePreset = writable('')

function initPresets() {
    const stored = JSON.parse(localStorage.getItem('z.presets') || '{}');
    presets.update(presets => ({
        ...presets, 
        ...stored
    }))
}

initPresets();
presets.subscribe(presets => localStorage.setItem('z.presets', JSON.stringify(presets)))

export const presetKeys = derived(
    presets,
    $presets => Object.keys($presets).sort((a, b) => a.localeCompare(b))
)

export function savePreset(key: string) {
    const stored = JSON.parse(localStorage.getItem('z.presets') || "{}");
    stored[key] = get(editorValue) // get current code from the Editor
    
    localStorage.setItem('z.presets', JSON.stringify(stored));
    presets.update(presets => ({...presets, ...stored}))
}