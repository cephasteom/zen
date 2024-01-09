const channel = new BroadcastChannel('zen')

/**
 * Class for fetching data from remote source
 * Store data in localStorage for better performance
 */
export class Data {
    data: any = {}
    key = ''
    _keys: string[] = []
    _worker: Worker

    constructor() {
        this._worker = new Worker(new URL('../workers/data.js', import.meta.url));
        // this._worker.postMessage('start');
    
        this._worker.addEventListener('message', (e) => {
            const { message, data } = e.data;
            data && localStorage.setItem(`z.data.${data.key}`, JSON.stringify(data.data));
            channel.postMessage({type: 'info', message});
        });

        return new Proxy(this, {
            get: (target, prop) => {
                const key = String(prop)

                if(key === 'fetch') this._worker.postMessage('start');
                
                // @ts-ignore
                if (key in target) return target[key]
                if(key === this.key) return this.data
                
                const data = localStorage.getItem(`z.data.${String(key)}`) || "{}"
                this.data = JSON.parse(data)
                this.key = key                
                return this.data
            },
        })

    }
    
    get keys() {
        return this._keys
    }

}