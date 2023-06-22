# ZEN3

## Syntax

### Stream
```js
// instantiate stream
const s0 = new Stream()
```

Parameters can be mapped across a cycle, or across each axis of the canvas.
```js
// map parameter across a cycle
s0.p('foo').range(0,2)

// map parameter across an axis
s0.px('bar').range(0,2)

// set position in time and space
// these are also parameters and have the same methods
// if you don't set t, it will default to the global t
s0.t.set(t)
s0.t.range(0,256,1,1)
s0.x.set(t*4)
s0.x.sin(0,16,1,1)

// key list of parameters based on position in time and space
// t is the global time
s0.get(t)
```

Streams have a number of useful properties.
* `s0.t` is the position in time. Should be an incrementing integer.
* `s0.q` is the number of frames per cycle, or the number of times `t` increments per cycle. Integer.
* `s0.s` is the size of the canvas. Integer.
* `s0.x`, `s0.y`, `s0.z` is the position in space.
* `s0.xyz` sets all axes simultaneously. Array.

### Parameter
Calling `s0.p(<key>)`, `s0.px(<key>)`, `s0.py(<key>)`, `s0.pz(<key>)` instantiates a Parameter at that key. Parameters have a number of methods which can be chained. Each method adds a callback to the stack, which are then evaluated sequentially at the point the user requests the parameter value. All parameters stored at `p` on the Stream are passed the current time value, all parameters stored at `px`, `py`, and `pz` are passed their corresponding axis value. In this way, you can create complex mappings of sonic parameters to a Stream's value in time and space.

Each time you call a method of a Parameter it gets added to a call stack. When you call `.get(value)` it pipes the callstack, passing the initial value to the first function, then the result to each subsequent function. The initial value should be a normalised value .

```js
// map a parameter across a cycle or the canvas using a range
s0.foo('foo').range(0,10).get(0.5) // returns 5
// additional arguments for freq and step
s0.foo('foo').range(0,10,4,0.5)

// all methods of the Math object (sin, cos, tan, etc) are methods of Parameter
s0.p('foo').sin().get(1)

// additional arguments can be used where appropriate (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math). For example:
s0.p('foo').range(0,7).pow(-2).get(7)

// chain additional methods to scale values further
s0.p('foo').cos().add(4).mul(0.5).step(1).get(0.5)
```
