const channel = new BroadcastChannel('zen')

/**
 * Class for fetching data from remote source
 * Store data in localStorage for better performance
 */
export class Data {
    data: any = {}
    key = ''
    _worker: Worker

    constructor() {
        this._worker = new Worker(new URL('../workers/data.ts', import.meta.url));
    
        this._worker.addEventListener('message', (e) => {
            const { message, data, key } = e.data;
            
            // prevent fetch being overwritten
            if(key === 'fetch') return channel.postMessage({type: 'info', message: 'Fetch is a reserved key'})

            // let the frontend know what's happening
            channel.postMessage({type: 'info', message});
            
            if(data) { 
                // store data in localStorage
                localStorage.setItem(`z.data.${key}`, JSON.stringify(data));
                // and store data in class
                this.data[key] = data
            }
        });

        return new Proxy(this, {
            get: (target, prop) => {
                const key = String(prop)

                // fetch is a reserved word
                if(key === 'fetch') {
                    return (endpoint: string, key: string) => this._worker.postMessage({endpoint, key});
                }
                
                // return data if it exists                
                if (key in this.data) return this.data[key]
                
                // if not, fetch it from local storage
                const data = localStorage.getItem(`z.data.${String(key)}`) || "{}"
                this.data[key] = JSON.parse(data)              
                return this.data[key]
            },
        })

    }
    
    get keys() {
        return Object.keys(this.data)
    }

}