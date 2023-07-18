export const tutorial = `# Tutorial
Welcome to Zen, a live coding tool for the browser that allows you to generate complex musical patterns with a small amount of code. Familiarity with JavaScript or another programming language is helpful, but not essential; with a little patience, you'll be making music in no time. 

This is a tutorial to help you get started. It's not meant to be comprehensive, but it should give you a good idea of how to use Zen. For more information, check out the [documentation](/docs) and the code examples in the [code editor](/). We recommend that you <a href="https://zen.cephasteom.co.uk" target="_blank">open the code editor in a separate tab</a> so that you can try out the examples whilst following this guide.

## What can Zen do?

For a flavour of what Zen can do, copy and paste the following code into the code editor and press *shift + enter* to play:
\`\`\`js
// todo
\`\`\`
Don't worry too much about the details at this point, simply change some values, press  *shift + enter* again, and see what happens. Press *esc* to stop playback or refresh the page if everything goes haywire.

## Time and space
Zen allows you to map musical parameters across periods of time, or across the different axes of a virtual canvas. Zen gives you control over 8 [Streams](docs) which you can move around. Streams are stored in the variables \`s0\` to \`s7\`, and each one has an x and y parameter which can be set to any value. Try the following example:
\`\`\`js
s0.x.set(8)
s0.y.set(8)
s0.e.set(1)
\`\`\`
Try changing the values of \`s0.x\` and \`s0.y\` and observe what happens to the movement of the stream.

When you hit play, you'll have noticed the value of \`t\` changing below the canvas. This represents the current time and is used, under the hood, as the basis for all the patterns you'll generate. You can use it in your own code too. Try this:
\`\`\`js
s0.x.set(t)
s0.y.set(8)
s0.e.set(1)
\`\`\`
Having access to a value that increments as time passes is extremely useful in generative music, and is also the basis for procedural drawing.

## Patterns
\`s0.x\`, \`s0.y\`, \`s0.e\`, and pretty much every musical parameter that we're going to set, are instances of a [Pattern](docs); a class with methods to help you generate interesting, varying values. We'll discuss a few methods here, but for a full list, check out the [Pattern](docs) documentation.

### Range
As we have seen, the \`set\` method of a Pattern takes a single value, and sets that value for the entire duration of the pattern. By contrast, the \`range\` method takes a start value and an end value, then moves linearly from one to the other over the course of a cycle. Try this:
\`\`\`js
s0.x.range(0,16)
s0.y.set(8)
s0.e.set(1)
\`\`\`
You can also pass a step value as the third argument, and a frequency value as the fourth argument. The step value rounds the output to the given step size, and the frequency value determines how many repetitions of the pattern occur per cycle. Try the following code, and then change the values of the step and frequency:
\`\`\`js
s0.x.range(0,16,4,0.5)
s0.y.set(8)
s0.e.set(1)
\`\`\`

### Sine
As we have seen, the \`set\` method of a Pattern takes a single value, and sets that value for the entire duration of the pattern. By contrast, the \`sine\` method takes a minimum of two values: a start value, an end value, and an optional step value. It then oscillates between the start and end values over the course of a cycle. Try this:
\`\`\`js
s0.x.sine(0,15,1)
s0.y.set(8)
s0.e.set(1)
\`\`\`

### Chaining methods
You can chain methods together to create more complex patterns. Try this:
\`\`\`js
s0.x.sine().mul(15)
s0.y.even().mul(8).add(4)
s0.e.every(t%3)

s1.y.sine().mul(15)
s1.x.even().mul(8).add(4)
s1.e.add(1).every(t%3)
\`\`\`
`;

