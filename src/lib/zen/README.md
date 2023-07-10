# ZEN3
Zen is a Javascript library for expressing complex patterns with very little code. It was written to take advantage of JS's flexibility and is primed for pattern interference. Zen allows you to map musical parameters across time and 3D space. Plot multiple trajectories around the canvas and trigger sonic events and modulations whose parameters are determined by the stream's current position in time and space.

Zen is designed to be used as a live coding tool and is available for experimentation at TODO. It can also be integrated into other projects requiring pattern generation. See section TODO for further guidance.
## Basics
Zen provides you with 4 const variables, 8 streams, and a global settings interface:
### Variables
* t: an incrementing integer representing time
* q: integer, number of divisions per cycle
* c: integer, current cycle. ie. floor(t / q)
* s: integer, size of canvas

### Streams
8 instances of the `Stream` class (see below), assigned to the variables `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7`. Used to map musical parameters across each cycle or the canvas, and determine the stream's trajectory across time and space.
### Zen
An instance of the `Zen` class (see below), assigned to the variable `z`. It is used to update the global `q` and `s` values. You are also able to pattern `z.t` to override the global time and `z.bpm` to control tempo.
## Syntax
### Pattern
Patterns are at the heart of Zen, allowing you to create complex patterns of number values. You don't usually instantiate the `Pattern` class, or call the `get()` method, directly; they are properties of a `Stream` or `Zen` (see below) and values are obtained under the hood. However, to illustrate how patterns work:
```js
const p = new Pattern()
// create a range of values from 0 to 4 and query the value at t
p.range(0,4).get(t, q) // args are time and divisions
// create a sine function from 0 to 10. Query the value at t
p.sine(0,10).get(t, q)
// chain methods together
p.tri(0,256,1).add(4).div(0.5).pow(2).clamp(0, 1024)
```

#### Snap
Snap a sample to the number of divisions.
```js
s0.px.snap.set(s)
```

#### Dur, Lag, ADSR
All of these values should be given in milliseconds. If you wish to quantize these values to the project tempo use `.btms()` - beats to milliseconds.
```js
z.bpm.set(139)
s0.p.dur.set(1).btms() // plays for 1 beat, regardless of the bpm
```

### Stream
#### Time and Space
TODO: s0.x, s0.t
#### Parameters
Musical parameters can be mapped in different ways across a cycle, or across each axis of the canvas, using methods `.p(key: string)`, `.px(key: string)`, `.py(key: string)`, and `.pz(key: string)`. Each method returns an instance of the `Pattern` class which enables you to map values in a variety of ways. E.g.
```js
// map parameter across a cycle using a range function
s0.p.foo.range(0,2)
// map parameter across the x axis using a sine function
s0.px.bar.sine(0,2)
// set a constant value
s0.p.foo.set(8)
// chain methods together for greater complexity
s0.pz.bar.saw(0,16).mul(2)
```
On each division of a cycle, each pattern is evaluated to create a list of parameters key / value pairs. Each method passes its value to the next in the chain, with the first value being the current time `t`. This allows you manipulate time or space using arithmetic.
```js
// offset foo by half a cycle
s0.p.foo.add(0.5).range(0,256)
// move across the x axis at twice the speed
s0.x.set(t)
s0.x.mul(2).range(0,s)
```

You can reference other streams' parameters:
```js
s0.p.foo.tri(16,24,1).add(32)
s1.p.bar.use(s0.p('foo')).mod(6)
```

Or simply get their value:
```js
s0.p.foo.tri(16,24,1).add(32)
s1.p.bar.set(s0.p('foo').get(t/q))
```
#### Events and Mutations
Use a stream's `e` and `m` properties to trigger musical events - discrete synth voices - or mutations - the modulation of all voices in a stream. Each property is, once again, an instance of the `Pattern` class, but evaluates the result as a boolean type, rather than a number. True triggers an event or mutation, false is ignored. JavaScript is able to infer boolean values from non-boolean types. As `0` is false and any value greater than `0` is true, we are able to pattern numbers in order to trigger our events.

```js
// trigger an event every division
s0.e.set(1)
// trigger an event every other division
s0.e.set(t%2)
// or...
s0.e.set(t).odd()
// use every to get regular rhythms
s0.e.every(1) // every cycle
s0.e.every(4) // every 4 cycles
s0.e.every(0.5) // twice per cycle - if q is regular
// various logic available to output 1s or 0s
s0.e.sine(0,1).gt(0.75) // greater than
s0.e.random(0,1,0.25).eq(0.75) // equal to
// convert numbers to binary patterns
s0.e.ntbin(76543, 16)
// or binary strings to binary patterns
s0.e.bin('01100101001010')
```

#### Key Mapping
You can map alternative key names using the `.map` property of a stream, which accepts an object. For example, to use more descriptive keys when sending midi messages, whilst still compiling parameters to use a `cc1` format:
```js
s0.map={cutoff: 'cc74'}
```
You may extend Zen by adding your own mappings in TBC. There is one map available:
```js
s0.map=keymap.nordlead1a
```

#### Solo | Mute
You can solo and mute streams. Solo and mute properties are also Patterns.
```js
s0.solo.set(1)
s0.solo.every(1)

s0.mute.set(1)
```