export function initElectronAPI() {

    if(typeof document === 'undefined' || (typeof window === 'undefined')) return
    
    window.electronAPI.onLoad(
        (code: string) => window.dispatchEvent(
            new CustomEvent('onLoadCode', { detail: { code } })
        )
    );
    window.electronAPI.onGetCode(() => {
        const code: string = localStorage.getItem('z.code') || '';
        window.electronAPI.getCodeResponse(code);
    });
}

export const isApp: () => boolean = () => {
    return typeof window !== 'undefined' && !!window.isApp;
}