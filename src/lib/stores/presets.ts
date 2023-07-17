import { writable, derived, get } from 'svelte/store';
import { editorValue } from './zen';

export const presets = writable({} as {[key: string]: string | null})

export const activePreset = writable('')

function initPresets() {
    const stored = JSON.parse(localStorage.getItem('z.presets') || '{}');
    presets.update(presets => ({
        ...presets, 
        ...stored, 
        ['user 1']: null,
        ['user 2']: null,
        ['user 3']: null,
        ['user 4']: null,
    }))
    activePreset.set(Object.keys(get(presets)).sort((a, b) => a.localeCompare(b))[0])
}

initPresets();
presets.subscribe(presets => localStorage.setItem('z.presets', JSON.stringify(presets)))

export const presetKeys = derived(
    presets,
    $presets => Object.keys($presets).sort((a, b) => a.localeCompare(b))
)

activePreset.subscribe(loadPreset)

function loadPreset(key: string) {
    const preset = get(presets)[key]
    if(!preset) return;
    
    // somehow update string in Editor component
}

export function savePreset(key: string) {
    const stored = JSON.parse(localStorage.getItem('z.presets') || "{}");
    stored[key] = get(editorValue) // get current code from the Editor
    
    localStorage.setItem('z.presets', JSON.stringify(stored));
    presets.update(presets => ({...presets, ...stored}))
}