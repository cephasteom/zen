# ZEN3
Zen is a Javascript library for expressing complex patterns with very little code. It was written to take advantage of JS's flexibility and is primed for pattern interference. Zen allows you to map musical parameters across a period of time or the x, y, z axes of a canvas. By manipulating the trajectories of up to 8 separate streams, you can trigger sonic events and mutations; with parameters being determined by the stream's current position in time and space.

Zen is designed to be used as a live coding tool and is available for experimentation at TODO. It can also be integrated into other projects where pattern generation is required. See section TODO for further guidance.
## Basics
Zen provides you with 4 global variables, 8 streams, and a global settings object:
### Variables
* t: an incrementing integer representing time
* q: integer, number of divisions per cycle
* c: integer, current cycle. ie. floor(t / q)
* s: integer, size of canvas

### Streams
8 instances of the `Stream` class (see below), assigned to the variables `s0`, `s1`, `s2`, `s3`, `s4`, `s5`, `s6`, `s7`. Used to map musical parameters across each cycle or the canvas, and determine the stream's trajectory across time and space.
### Zen
An instance of the `Zen` class (see below), assigned to the variable `z`. Used to update the global `q` and `s` values, as well as other global settings such as `bpm`.

## Syntax
### Stream
#### Time and Space
TODO: s0.x, s0.t
#### Parameters
Musical parameters can be mapped in different ways across a cycle, or across each axis of the canvas, using methods `.p(key: string)`, `.px(key: string)`, `.py(key: string)`, and `.pz(key: string)`. Each method returns an instance of the `Pattern` class which enables you to map values in a variety of ways. E.g.
```js
// map parameter across a cycle using a range function
s0.p('foo').range(0,2)
// map parameter across the x axis using a sine function
s0.px('bar').sine(0,2)
// set a constant value
s0.p('foo').set(8)
// chain methods together for greater complexity
s0.pz('bar').saw(0,16).mul(2)
```
On each division of a cycle, each pattern is evaluated to create a list of parameters key / value pairs. Each method passes its value to the next in the chain, with the first value being the current position in time or in space, expressed as a fraction of 1. For example, 0.5 would be half way across a cycle or the canvas. This allows you manipulate time or space using arithmetic.
```js
// offset foo by half a cycle
s0.p('foo').add(0.5).range(0,256)
// move across the x axis at twice the speed
s0.x.set(t)
s0.x.mul(2).range(0,s)
```

You can reference other streams' parameters:
```js
s0.p('foo').tri(16,24,1).add(32)
s1.p('bar').use(s0.p('foo')).mod(6)
```

Or simply get their value:
```js
s0.p('foo').tri(16,24,1).add(32)
s1.p('bar').set(s0.p('foo').get(t/q))
```


#### Events and Mutations




```js
s0.t.set(t)
s0.t.range(0,256,1,1)
s0.x.set(t*4)
s0.x.sin(0,16,1,1)

// key list of parameters based on position in time and space
// t is the global time
s0.get(t)
```



### Pattern
TODO
Calling `s0.p(<key>)`, `s0.px(<key>)`, `s0.py(<key>)`, `s0.pz(<key>)` instantiates a Parameter at that key. Parameters have a number of methods which can be chained. Each method adds a callback to the stack, which are then evaluated sequentially at the point the user requests the parameter value. All parameters stored at `p` on the Stream are passed the current time value, all parameters stored at `px`, `py`, and `pz` are passed their corresponding axis value. In this way, you can create complex mappings of sonic parameters to a Stream's value in time and space.

Each time you call a method of a Parameter it gets added to a call stack. When you call `.get(value)` it pipes the callstack, passing the initial value to the first function, then the result to each subsequent function. The initial value should be a normalised value .

```js
// map a parameter across a cycle or the canvas using a range
s0.foo('foo').range(0,10).get(0.5) // returns 5
// additional arguments for freq and step
s0.foo('foo').range(0,10,4,0.5)

// choose from an array of values. Second value is for freq.
s0.foo('foo').seq([0,2,4,6], 1)

// use waveforms - sine, cosine, saw, tri, and square. Arguments same as range...
s0.sine('foo').range(0,10,4,0.5).get(0.5)

// use noise function. Noise is seeded once on page load
s0.noise('foo').range(0,10,4,0.5).get(0.5)

// all methods of the Math object (sin, cos, tan, etc) are methods of Parameter (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
s0.p('foo').sin().get(1)

// additional arguments can be used where appropriate. For example:
s0.p('foo').range(0,7).pow(-2).get(7)

// chain additional methods to scale values further
s0.p('foo').cos().add(4).mul(0.5).step(1).get(0.5)

// clamp
s0.p('foo').range(0,10).clamp(0,1).get(5)
```
