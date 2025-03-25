interface Window {
    isApp: boolean;
    electronAPI: {
        onLoad: (callback: (code: string) => void) => void;
    }
}