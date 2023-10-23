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
        fetch('http://localhost:5000/data.json')
            .then(res => {
                return res.json()
            })
            .then(json => {
                if(!json) return
                this._keys = Object.keys(json)
                this._keys.forEach(key => localStorage.setItem(`z.data.${key}`, JSON.stringify(json[key])))
                channel.postMessage({type: 'success', message: 'Loaded data from ' + 'http://localhost:5000/data.json'})
                channel.postMessage({ type: 'success', message: 'Data keys ->'})
                channel.postMessage({ type: 'info', message: this.keys.join(',') + '\n'})
            })
            .catch(_ => channel.postMessage({type: 'info', message: 'No data from ' + 'http://localhost:5000/data.json\n'}))

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