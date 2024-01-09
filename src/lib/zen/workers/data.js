/**
 * @type {string | any[]}
 */
const storedKeys = []

self.addEventListener('message', (e) => {
    fetch('https://zendata.cephasteom.co.uk/api/packet')
        .then(res => res.json())
        .then(data => {
            storedKeys.includes(data.key) 
                ? self.postMessage({message: 'No new data available'}) 
                : self.postMessage({data, message: 'Data received from ' + 'https://zendata.cephasteom.co.uk/api/packet\n' + 'Key: ' + data.key});
            storedKeys.push(data.key);
        })
        .catch(_ => self.postMessage({message: 'Data unavailable from ' + 'https://zendata.cephasteom.co.uk/api/packet\n'}));
});
