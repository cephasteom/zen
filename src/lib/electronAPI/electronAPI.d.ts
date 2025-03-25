interface Window {
    isApp: boolean;
    electronAPI: {
        onLoad: (callback: (code: string) => void) => void;
        onGetCode(callback: () => void): void;
        getCodeResponse(code: string): void;
    }
}