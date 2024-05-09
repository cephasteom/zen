self.addEventListener('message', (e) => {
    const { endpoint, key} = e.data;

    fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            self.postMessage({key, data, message: 'Data received. Key: ' + key});
            
        })
        .catch(_ => self.postMessage({message: 'Data unavailable from ' + endpoint + '\n'}));
});
