export default `# Custom Samples
There are a number of ways to load your own samples in Zen. 

## loadSamples()
The \`loadSamples()\` function allows you to load samples that are publicly availble via a URL. It takes two arguments:
* an object whose keys are the name of the sample banks and whose values are the arrays of sample URLs
* an optional base URL to prepend to each sample URL
\`\`\`js
loadSamples({
  test: [
    'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/808bd/BD0000.WAV'
  ]
})

s0.set({inst:1,bank:'test'})
s0.e.every(2)
\`\`\`

## localhost:5000
Zen fetches samples via HTTP requests, looking for additional, locally served files on localhost:5000. To serve your own samples, download and install this [simple package](https://github.com/cephasteom/zen-connect). Follow the instructions in the README.md and refresh Zen. Your custom samples should be listed in the console when you run the command \`samples()\`.
`