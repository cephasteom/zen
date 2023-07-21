// TODO: link to a video tutorial

export const tutorial = `# Tutorial
Welcome to Zen, a live coding tool for the browser that allows you to generate complex musical patterns with a small amount of code. Familiarity with JavaScript or another programming language is helpful, but not essential; with a little patience, you'll be making music in no time. 

This is a tutorial to help you get started. It's not meant to be comprehensive, but it should give you a good idea of how to use Zen. For more information, check out the [documentation](/docs) and the code examples in the [code editor](/). We recommend that you <a href="https://zen.cephasteom.co.uk" target="_blank">open the code editor in a separate tab</a> so that you can try out the examples whilst working through this guide.

## What does Zen sound like?

For a flavour of what Zen can do, copy and paste the following code into the code editor and press *shift + enter* to play:
\`\`\`js
// todo
\`\`\`
Don't worry too much about the details at this point, simply change some values, press  *shift + enter* again, and see what happens. Press *esc* to stop playback or refresh the page if everything goes haywire.

## Time and space
Zen allows you to map musical parameters across periods of time and/or the axes of a virtual canvas; then trigger events at different points in time and space to elicit different sounds. Before we tackle these parameters, let's look at how to move around the canvas. Zen gives you control over 8 [Streams](docs); assigned to the variables \`s0\` to \`s7\`. Each Stream has an x and y parameter which can be set to a numerical value. Try the following example:
\`\`\`js
s0.x.set(8)
s0.y.set(8)
s0.e.set(1)
\`\`\`
Try changing the numbers in parentheses at \`s0.x\` and \`s0.y\` and observe what happens to the movement of the stream.

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
As we have seen, the \`set\` method of a Pattern takes a single value, and sets it for the duration of the pattern. By contrast, the \`range\` method takes a start value and an end value, then moves linearly from one to the other over the course of a cycle. Try this:
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
The \`sine\` method takes a minimum of two values: a start value, an end value, and an optional step value. It then oscillates between the start and end values over the course of a cycle. Try this:
\`\`\`js
s0.x.sine(0,15,1)
s0.y.set(8)
s0.e.set(1)
\`\`\`

### Chaining methods
You can chain methods together to create more complex patterns:
\`\`\`js
s0.x.tri(0,8,1,0.5).clamp(4,12)
s0.y.add(8).tri(0,8,1,0.5).clamp(4,12)
s0.e.every(1)
\`\`\`

## Global settings
You can update global parameters, such as the size of the canvas, or the number of steps per cycle, using the Zen class, represented in your code as the variable \`z\`:
\`\`\`js
z.q = 32 // set the number of steps per cycle to 32.
z.s = 11 // set the size of the canvas to 11.
\`\`\`
The global time and global tempo parameters are instance of a Pattern, allowing you to use Pattern methods for interesting results:
\`\`\`js
z.s=15
z.q=16
z.bpm.set(240)
z.t.tri(0,q*2,1,0.25).add(20)

s0.x.tri(0,16,1,0.5).clamp(4,12).take(1)
s0.y.add(8).tri(0,16,1,0.5).clamp(4,12).take(1)
s0.e.every(1)

s1.x.tri(0,16,1,0.5).clamp(4,12).add(2)
s1.y.add(8).tri(0,16,1,0.5).clamp(4,12).add(2)
s1.e.every(1)

s2.x.tri(0,16,1,0.5).clamp(4,12).take(4)
s2.y.add(8).tri(0,16,1,0.5).clamp(4,12).take(4)
s2.e.every(1)
\`\`\`

## Let's make some noise
Now that we've covered the basics, let's make some noise. The simplest way of setting musical parameters is to use the \`.set()\` method on each stream - which takes a list of keys and values as its sole argument. Try this:
\`\`\`js
s0.set({inst: 'synth', n: 48, dur: 1000})
s0.e.every(8)
\`\`\`
Zen comes with a number of built-in instruments, which you can find in the [documentation](docs). The \`n\` parameter sets the note, and the \`dur\` parameter sets the duration of the note in milliseconds. These are default parameters found on all instruments. Each instrument also has its own special parameters, for example:
\`\`\`js
s0.set({inst: 'synth', n: 48, dur: 1000, modi: 2, harm: 1.25})
s0.e.every(8)
\`\`\`
Of course, interesting musical results come from parameters that change over time. You can map changing parameters to the passing of time, using a stream's \`p\` property. Any parameter name written after the \`p\` property is an instance of [Pattern](docs) and is mapped to the passing of time. Try this:
\`\`\`js
s0.set({inst: 'synth', n: 48, dur: 1000, cut: 0, reverb: 0.5})
s0.p.modi.range(0,4,1,0.5)
s0.p.harm.range(0,4,0.125,0.5)
s0.e.every(1)
\`\`\`
Or you can map parameters to the x, and y axes of the canvas, using a stream's \`px\` and \`py\` properties. Any parameter name written after the \`px\` or \`py\` properties is an instance of [Pattern](docs) and is mapped to the x or y axis of the canvas. Try this:
\`\`\`js
s0.set({inst: 'synth', n: 48, dur: 1000, cut: 0, reverb: 0.5})
s0.px.modi.range(0,4,1,0.5)
s0.py.harm.range(0,4,0.125,0.5)
s0.x.set(t)
s0.y.sine(0,15)
s0.e.every(1)
\`\`\`

## Events
// show different ways of triggering events
## Mutations
// explain mutations

## Pattern Interference

## Conclusion


`;


