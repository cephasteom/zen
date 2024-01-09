self.addEventListener('message', (e) => {
    fetch('http://localhost:5000/data.json')
        .then(res => res.json())
        .then(json => {
            self.postMessage({type: 'data', data: json});
        })
        .catch(_ => self.postMessage({type: 'info', message: 'No data from ' + 'http://localhost:5000/data.json\n'}));
});
