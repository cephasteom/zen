export default `# The Canvas
So far we’ve mapped all parameters across time using the \`.p\` property. In Zen, you can use the x, y, and z position of each stream to maps parameters across space, allowing you to compose in 4 dimensions.

## .x .y .z
The \`.x\`, \`.y\`, and \`.z\` properties of a stream allow you to move a stream around a virtual space and are all instances of the [Pattern class](/docs/classes#pattern). This movement is represented in 2 dimensions (xy) on the visualiser using the concept of a sphere. We have chosen to use the x axis as the horizontal rotation of the sphere, the y axis as the vertical rotation.
\`\`\`js
s0.e.every(1)
s0.x.saw()
s0.y.noise()
\`\`\`

## Using .x .y .z
When you use the \`.p\` property, the current time is passed as the first value to your chain of methods. You can replace this with the position of a stream:
\`\`\`js
s0.set({inst:0,cut:0,re:0.5})

s0.x.saw() // set the stream's x position
s0.y.noise() // set the stream's y position

s0.p.n.set(s0.x).set('Dlyd%12..*16') // map the note number pattern across time
s0.p.modi.set(s0.x).saw(1,10) // map the modulation index pattern over the x axis
s0.p.harm.set(s0.y).saw(0.5,3,0.25) // map the harmonicity ratio over the y axis

s0.e.every(1)
\`\`\`

The canvas can be used or ignored at will. However, composing with four dimensions can be a useful way of managing complexity. For example, you could place the overall intensity of the piece on the z axis, and use the x and y axes to control the movement of individual streams.

As we shall see, plotting a stream's position in 3D space comes into its own when you start using Zen's quantum features.

## Grid
Alternatively, you can overwrite the stream positions on the canvas using \`z.grid\`. This is an instance of the Pattern class and expects an array of values between 0 and 1. Using the length of the array as the size of the grid, it will visualise the data that you send. For example:
\`\`\`js
z.grid.set(() => Array.from({length: 16*16}, () => Math.random()))
\`\`\`

If you want to determine the width and height of the grid, you can pass a 2D array:
\`\`\`js
z.grid.set(() => Array.from({length: 16}, () => Array.from({length: 16}, () => Math.random())))
\`\`\`

Whilst this has no bearing on the sound, you can sonify this data elsewhere in your code. Potential uses are for cellular automata. The \`.persist()\` pattern method can be used to modify the grid over time, allowing you to create evolving patterns. 

Here's an example of the famous Game of Life:
\`\`\`js
// Create a new grid
const create = size => Array(size).fill()
  .map(() => Array(size).fill()
  .map(() => Math.floor(Math.random() * 2)));

// count the neighbours of a cell
const countNeighbours = (grid, x, y) => [-1, 0, 1].flatMap(dx =>
    [-1, 0, 1].map(dy => {
      if (dx == 0 && dy == 0) return 0;
      const newX = (x + dx + z.s) % z.s;
      const newY = (y + dy + z.s) % z.s;
      return grid[newX][newY] ? 1 : 0;
    })
  ).reduce((a, b) => a + b);

// determine next state of cell
const shouldLive = (cell, neighbours) => (cell 
  ? neighbours == 2 || neighbours == 3 
  : neighbours == 3)
    ? 1
    : 0;

// generate next state of grid
const next = grid => grid.map((row, x) =>
  row.map((cell, y) => 
    shouldLive(cell, countNeighbours(grid, x, y))
  ));

// use the persist method to change previous iteration
z.grid.persist((_, last) => {
  const grid = last ? last : create(z.s);
  return next(grid);
});
\`\`\`
`