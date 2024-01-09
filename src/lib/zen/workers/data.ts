
const storedKeys: string[] = []

self.addEventListener('message', (e) => {
    if(e.data === 'last') {
        fetch('https://zendata.cephasteom.co.uk/api/packet')
            .then(res => res.json())
            .then(data => {
                storedKeys.includes(data.key) 
                    ? self.postMessage({message: 'No new data available'}) 
                    : self.postMessage({data, message: 'Data received from ' + 'https://zendata.cephasteom.co.uk/api/packet\n' + 'Key: ' + data.key});
                storedKeys.push(data.key);
            })
            .catch(_ => self.postMessage({message: 'Data unavailable from ' + 'https://zendata.cephasteom.co.uk/api/packet\n'}));
    }

    if(e.data === 'all') {
        fetch('https://zendata.cephasteom.co.uk/api/packets')
            .then(res => res.json())
            .then(data => {
                data.forEach((packet: {key: string}) => {
                    storedKeys.includes(packet.key) 
                        ? self.postMessage({message: 'No new data available'}) 
                        : self.postMessage({packet, message: 'Data received from ' + 'https://zendata.cephasteom.co.uk/api/packets\n' + 'Key: ' + packet.key});
                    storedKeys.push(packet.key);
                })
            })
            .catch(_ => self.postMessage({message: 'Data unavailable from ' + 'https://zendata.cephasteom.co.uk/api/packets\n'}));
    }
});
