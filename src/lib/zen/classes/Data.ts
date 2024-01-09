const channel = new BroadcastChannel('zen')

/**
 * Class for fetching data from remote source
 * Store data in localStorage for better performance
 */
export class Data {
    data: any = {}
    key = ''
    _keys: string[] = []

    constructor() {
        const worker = new Worker(new URL('../workers/data.js', import.meta.url));
        worker.postMessage('start');
    
        worker.addEventListener('message', (e) => {
            if (e.data.type === 'data') {
                const keys = Object.keys(e.data.data);
                keys.forEach(key => localStorage.setItem(`z.data.${key}`, JSON.stringify(e.data.data[key])));
                channel.postMessage({type: 'info', message: 'Data fetched from ' + 'http://localhost:5000/data.json\n'});
            } else {
                const { type, message } = e.data;
                channel.postMessage({ type, message });
            }
        });

        return new Proxy(this, {
            get: (target, prop) => {
                const key = String(prop)
                
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