export default `# Working with Data
Sonifying data open up new avenues of musical exploration. Zen provides a simple way of fetching and storing data from the web. This chapter will not explore sonification strategies, but rather focus on the data fetching and storing process.

## The Data Object
All data is stored in local storage within your browser so that it persists between sessions. You can access this data using the \`data\` object, represented by the variable \`d\`. This object has some simple methods.

### d.fetch()
The \`fetch()\` method is used to retrieve data from the web. It takes a URL and a key as arguments. In a web worker, it fetches whatever data is returned from making a GET request to the URL and stores it in local storage under the key. For example:
\`\`\`js
// This will fetch the data from the URL and store it under the key 'packet'
d.fetch('https://zendata.cephasteom.co.uk/api/packet', 'packet')


// console.log(d.packet)
\`\`\`

Once a success message has been printed to the console, you can access the data using \`d\` and the key you provided, in this case \`d.packet\`:

\`\`\`js
// console.log(d.packet)
\`\`\`
`