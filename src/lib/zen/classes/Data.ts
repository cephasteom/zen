export class Data {
    data: any = {}
    key = ''

    constructor() {
        fetch('http://localhost:5000/data.json')
            .then(res => {
                return res.json()
            })
            .then(json => {
                if(!json) return
                Object.keys(json).forEach(key => localStorage.setItem(`z.data.${key}`, JSON.stringify(json[key])))
                console.log('Loaded data from ' + 'http://localhost:5000/data.json')
            })
            .catch(_ => console.log('No data available at ' + 'http://localhost:5000/data.json'))

        return new Proxy(this, {
            get: (target, prop) => {
                const key = String(prop)
                if(key === this.key) return this.data
                const data = localStorage.getItem(`z.data.${String(key)}`) || {}
                this.data = data
                this.key = key                
                return this.data
            },
        })
    }


}