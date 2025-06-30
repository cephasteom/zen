export default `# Custom Samples
There are a number of ways to load your own samples in Zen. 

## loadSamples()
The \`loadSamples()\` function allows you to load samples that are publicly available via a URL. It takes two arguments:
* an object - keys are the names of the sample bank, values are arrays of sample URLs
* an optional base URL to prepend to each sample URL
\`\`\`js
loadSamples(
  {test: ['808bd/BD0000.WAV'], '808bd/BD0001.WAV']}, 
  'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/'
)

s0.set({inst:1,bank:'test'})
s0.e.every(2)
\`\`\`

You can also load a JSON file containing the sample bank object. For example, here's how you can rather brazenly load the Dirt Samples from TidalCycles:
\`\`\`js
loadSamples(
  'https://raw.githubusercontent.com/tidalcycles/dirt-samples/main/strudel.json',
  'https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/'
)

s0.set({inst:1,bank:'ravemono'})
s0.e.every(16)

samples()
\`\`\`

## localhost:6060
Zen fetches samples via HTTP requests, looking for additional, locally served files on localhost:6060. To serve your own samples, download and install this [simple package](https://github.com/cephasteom/zen-connect). Follow the instructions in the README.md and refresh Zen. Your custom samples should be listed in the console when you run the command \`samples()\`.

## Desktop App
If you are using the Zen desktop app, you can load any directory of directories containing samples. The app will load all samples, using the directory names as sample banks. Go to File > Load Samples Directory.
`