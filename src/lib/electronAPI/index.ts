import { loadCode, editorValue } from '$lib/stores/zen';
import { get } from 'svelte/store';

export function initElectronAPI() {

    if(typeof document === 'undefined' || (typeof window === 'undefined')) return
    
    window.electronAPI.onLoad((code: string) => loadCode.set(code));
    window.electronAPI.onGetCode(() => {
        const code: string = get(editorValue);
        window.electronAPI.getCodeResponse(code);
    });
}

export const isApp: () => boolean = () => {
    return typeof window !== 'undefined' && !!window.isApp;
}