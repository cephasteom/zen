import { loadCode } from '$lib/stores/zen';

export function initElectronAPI() {

    if(typeof document === 'undefined' || (typeof window === 'undefined')) return
    
    window.electronAPI.onLoad((code: string) => loadCode.set(code));
}

export const isApp: () => boolean = () => {
    return typeof window !== 'undefined' && !!window.isApp;
}