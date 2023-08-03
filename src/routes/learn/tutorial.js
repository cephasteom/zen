// TODO: link to a video tutorial

export const tutorial = `# Tutorial
Welcome to Zen, a live coding tool for the browser that allows you to generate complex musical patterns with a small amount of code. Familiarity with JavaScript or another programming language is helpful, but not essential; with a little patience, you'll be making music in no time. 

This is a tutorial to help you get started. It's not meant to be comprehensive, but it should give you a good idea of how to use Zen. For more information, check out the [documentation](/docs) and the code examples in the [code editor](/). We recommend that you <a href="https://zen.cephasteom.co.uk" target="_blank">open the code editor in a separate tab</a> so that you can try out the examples whilst working through this guide.

## What am I looking at?
On desktop, the Zen app has a code editor on the left hand side, a pattern visualiser on the right and, below that, a list of useful values. \`t\` represents the current time, \`c\` shows the current cycle number, \`q\` represents the number of steps per cycle (how many time \`t\` increments each cycle), and \`s\` represents the size of the canvas. 

## What does it sound like?
For a flavour of what Zen can do, copy and paste the following code into the editor and press *shift + enter* to play:
\`\`\`js
z.s = (t%q)+4
z.q = z.s
z.set({inst: 'synth', reverb: 0.75, vol: 0.25, lag: 1000, s: 0.25, r: 2000})
z.p.n.scales('d-dorian', 16)

s0.set({cut: 1, harm: 1.01})
s0.p.n.use(z.p.n).add(12)
s0.px._modi.range().mul((c%16)).div(4)
s0.x.noise(0,s)
s0.e.every((c%4) + 3)
s0.m.every(2)

s1.p.n.use(z.p.n)
s1.px._modi.range()
s1.py._harm.range(1,2,0.25)
s1.x.eval(s0.x).$sub(s)
s1.y.noise(0, s-1)
s1.e.use(s0.e).neq(1)
s0.m.set(1)

s2.p.n.use(z.p.n).add(12)
s2.y.set(s/3)
s2.x.set(t)
s2.e.every(4)
s2.m.every(6)

s3.p.delay.saw(0,1,0,0.125)
s3.p._n.eval(s2.p._n).add(19)
s3.y.set(s*(2/3))
s2.x.set(s-t)
s3.e.eval(s2.e)
s3.m.every(4)
\`\`\`
Don't worry about the details, simply change some values, comment out some lines, press  *shift + enter* again, and see what happens. Press *esc* to stop playback or refresh the page if everything goes haywire.

## Time and space
Zen allows you to map musical parameters across periods of time and/or the axes of a virtual canvas; then trigger events at different points in time and space to elicit different sounds. Before we tackle these parameters, let's look at how to move around the canvas. Zen gives you control over 8 [Streams](docs), which you can think of as a single musical layer. These are assigned to the variables \`s0\` to \`s7\`. Each Stream has an x and y parameter, used to move it around the canvas. Try the following example:
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

You can even set all axes simultaneously, using the \`xyz\` method of a Stream. Try this:
\`\`\`js
s0.xyz.set([t,8,0])
s0.e.set(1)
\`\`\`

## Patterns
\`s0.x\`, \`s0.y\`, \`s0.e\`, and pretty much every musical parameter that we're going to set, are instances of a [Pattern](docs); a class with methods to help you generate interesting, varying values. We'll discuss a flavour of these below:

### Range
As we have seen, the \`set\` method of a Pattern takes a single value, and sets it for the duration of the pattern. By contrast, the \`range\` method takes a start value and an end value, then moves linearly from one to the other over the course of a cycle. Try this:
\`\`\`js
s0.x.range(0,16)
s0.y.set(8)
s0.e.set(1)
\`\`\`
Range also has arguments for step size and frequency. The step value rounds the output to the given step size, and the frequency value determines how many repetitions of the pattern occur each cycle. Try the following code, and play around with the values:
\`\`\`js
s0.x.range(0,16,4,0.5)
s0.y.set(8)
s0.e.set(1)
\`\`\`

### Sine
The \`sine\` method has the same arguments as range, but the result is an oscillation between the start and end values over the course of a cycle. Try this:
\`\`\`js
s0.x.sine(0,15,1)
s0.y.set(8)
s0.e.set(1)
\`\`\`

### Chaining methods
You can chain methods together to create more complex patterns:
\`\`\`js
s0.x.tri(0,16,1,0.5).clamp(4,12)
s0.y.add(8).tri(0,16,1,0.5).clamp(4,12)
s0.e.every(1)
\`\`\`

For a full list of Pattern methods, check out the [docs](docs).

### Pattern Logic
You can compare patterns chains using \'AND\', \'OR\', and \'XOR\' logic. Try this:
\`\`\`js
s0.set({inst: 'synth', n: 48, dur: 1000})
s0.e.every(5).OR.every(7)
\`\`\`

### Pattern Maths
You can perform mathematical operations on chains of patterns using \`ADD\`, \`SUB\`, \`MUL\`, and \`DIV\`. Note the use of capitals to distinguish these from the methods of the same name. Try this:
\`\`\`js
s0.set({inst: 'synth'})
s0.e.bin('1001 0110')

s1.set({inst: 'synth', cut: 1})
s1.p.n.scales('c-dorian', 16).add(12) // uses the add method
    .ADD.eval(s0.e).if(12,0) // uses the add operator to add the outcome of another pattern. In this case, if s0.e is 1, add 12, otherwise add 0.
s1.e.set(1)
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
s0.set({inst: 'synth', dur: 1000, cut: 0, reverb: 0.5, locut: 0.3})
s0.p.n.scales('d-minpent', 16)
s0.px.modi.range(0,4,1,0.5)
s0.py.harm.range(0,4,0.125,0.5)
s0.x.set(t)
s0.y.sine(0,15)
s0.e.every(1)
\`\`\`

## Events and mutations
When a sound is triggered, it is called an event. You can trigger events using the \`e\` property of a stream. The \`e\` property is an instance of [Pattern](docs) and will trigger an event each time it receives a value that is greater than 0. Try this:
\`\`\`js
z.bpm.set(30);

s0.set({inst: 'synth', cut: 0})
s0.p.n.scales('d-dorian', 16)
s0.px.harm.range(1,5,0.25)
s0.py.modi.range(1,10)

s0.x.random(0,16,1)
s0.y.random(0,16,1)
s0.e.set(1)
\`\`\`

Here, \`e\` is always set to 1, so an event is triggered every time the code is executed. As you can hear, the musical parameters change with each event. The \`n\` parameter maps a scale to time. Since we're letting time flow in a linear direction, the position of the stream on the canvas doesn't affect the note - it keeps cycling through the scale. However, the \`harm\` and \`modi\` parameters are mapped to the x and y axes of the canvas, so these parameters changes as the stream moves randomly around the canvas.

When an event is triggered, the parameters remain the same for the duration of the event. What happens if you want to change parameters in between events? Mutations allow you to adjust a stream's parameters at any point in time, without triggering a new event. It will affect all active events within that stream. To make a parameter mutable, prefix it with \`_\`. Then, trigger a mutation using the \`m\` property of a stream - again, another instance of [Pattern](docs). The example below sets the \`harm\` parameter to mutate in between each event. Try adding \`_\` to other parameters to hear the difference:
\`\`\`js
z.bpm.set(30);

s0.set({inst: 'synth', cut: 0, dur: 2000})
s0.p.n.scales('d-dorian', 16)
s0.px._harm.range(1,5,0.25)
s0.py.modi.range(1,10)

s0.x.random(0,16,1)
s0.y.random(0,16,1)
s0.e.every(4)
s0.m.every(2)
\`\`\`
You can control how quickly a stream mutates using the \`lag\` parameter:
\`\`\`js
z.bpm.set(30);

s0.set({inst: 'synth', cut: 0, dur: 2000})
s0.p.lag.set(1).btms()
s0.p.n.scales('d-dorian', 16)
s0.px._harm.range(1,5,0.25)
s0.py.modi.range(1,10)

s0.x.random(0,16,1)
s0.y.random(0,16,1)
s0.e.every(4)
s0.m.every(2)
\`\`\`

## Cutting events
You can cut events short using the \`cut\` parameter. This is useful for truncating sounds in the same or other streams when a new sound is triggered:
\`\`\`js
z.set({inst: 'synth', dur: 4000})
z.px.n.scales('d-dorian', 16)

s0.set({cut: [0,1]}) // cut stream 0 and 1 when new event is triggered
s0.x.range(0,s)
s0.e.every(8)

s1.x.range(0,s)
s1.y.set(s/2)
s1.e.add(4).every(8)
\`\`\`
You can control how quickly a stream cuts using the \`cutr\` parameter, a value given in ms.

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

s0.x.tri(0,16,1,0.5).clamp(4,12).sub(1)
s0.y.add(8).tri(0,16,1,0.5).clamp(4,12).sub(1)
s0.e.every(1)

s1.x.tri(0,16,1,0.5).clamp(4,12).add(2)
s1.y.add(8).tri(0,16,1,0.5).clamp(4,12).add(2)
s1.e.every(1)

s2.x.tri(0,16,1,0.5).clamp(4,12).sub(4)
s2.y.add(8).tri(0,16,1,0.5).clamp(4,12).sub(4)
s2.e.every(1)
\`\`\`

You can even set global musical parameters using the \`p\`, \`px\`, and \`py\` properties, exactly as you would for a stream. If you use the same parameter name for a stream and a global parameter, the stream's parameter will take precedence. 
\`\`\`js
z.set({inst: 'synth', reverb: 0.75, vol: 0.25, lag: 1000})
z.p.n.scales('d-dorian', 16)

s0.e.every(4)

s1.set({reverb: 0}) // overwrite the global reverb
s1.p.n.use(z.p.n).add(12)
s1.e.use(s0.e).neq(1)
\`\`\`

## Pattern interference
Zen was designed to allow you express complex patterns, then let them interfere with each other to create interesting, unplanned results. The example below uses various logical methods of Pattern to make each stream interact with each other:
\`\`\`js
z.s = (t%q)+4
z.q = z.s

s0.set({inst: 'synth', reverb: 0.75, vol: 0.25, lag: 1000, s: 0.25, r: 2000, cut: 1, harm: 1.01})
s0.p.n.scales('d-dorian', 16).add(12)
s0.px._modi.range().mul((c%16)).div(4)
s0.x.noise(0,s)
s0.e.every((c%4) + 3)
s0.m.every(2)

s1.set({inst: 'synth', reverb: 1, cut: 1, vol: 0.25, rsize: 0.75, lag: 1000})
s1.p.n.scales('d-dorian', 8)
s1.px._modi.range().mul((c%16)).div(8)
s1.x.eval(s0.x).$sub(s)
s1.e.use(s0.e).neq(1)
s0.m.set(1)
\`\`\`

## Advanced
So, how does this all work then? At the top level, Zen executes your code each time \`t\` increments. Where you've use \`t\` in your code, this will change each frame, allowing you to approach pattern generation as you would procedural drawing. 

Instances of Pattern are used for musical parameters, events and mutations. Each time you chain a method, a new function is added to a stack of callbacks. After your code has executed, Zen calculates the current \'t\' value and passes it to the first function in the stack. The result is passed to the next function, and so on. The result of the last function is then used to set the parameter.

If you need to get the value of a stream's parameter, perhaps using it in another stream, you can pass the parameter to the \`eval\` method of a Pattern. This will return the current value of the parameter. For example:
\`\`\`js
s0.set({inst: 'synth'})
s0.p._n.scales('d-dorian', 16)
s0.e.every(4)
s0.m.every(2)

s1.set({inst: 'synth', lag: 100})
s1.p._n.eval(s0.p._n).add(7)
s1.e.eval(s0.e)
s1.m.every(2)
\`\`\`

## Conclusion
Zen is in its infancy. It needs an active user base to help it grow and improve. If you have any questions, suggestions, or feedback, or you'd like to contribute to the project, check out the [GitHub repo](https://github.com/cephasteom/zen-3) and open an issue. Thanks for reading!
`;


