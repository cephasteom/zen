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
        this._worker = new Worker(new URL('../workers/data.ts', import.meta.url));
    
        this._worker.addEventListener('message', (e) => {
            const { message, data } = e.data;
            channel.postMessage({type: 'info', message});
            
            if(data) { 
                localStorage.setItem(`z.data.${data.key}`, JSON.stringify(data.data));
                this._keys = this._keys.includes(data.key) ? this._keys : [...this._keys, data.key]
            }
        });

        return new Proxy(this, {
            get: (target, prop) => {
                const key = String(prop)

                if(key === 'fetch') this._worker.postMessage('last');
                if(key === 'all') this._worker.postMessage('all');
                
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