export default `# The Canvas
So far we’ve mapped all parameters across time using the \`.p\` property. Zen also maps parameters across space, allowing you to compose in 4 dimensions.

## .x .y .z
The \`.x\`, \`.y\`, and \`.z\` properties of a stream allow you to move a stream around a virtual space and are all instances of the [Pattern class](/docs/classes#pattern). This movement is represented in 3 dimensions (xyz) on the visualiser using the concept of a sphere. We have chosen to use the x axis as the horizontal rotation of the sphere, the y axis as the vertical rotation, and the z axis as the distance from the centre of the sphere.
\`\`\`js
s0.e.every(1)
s0.x.saw()
s0.y.noise()
\`\`\`

## .px .py .pz
Just as the \`.p\` property maps different parameters across time, \`.px\`, \`.py\`, \`.pz\` map parameters across each axis of the canvas:
\`\`\`js
s0.set({inst:0,cut:0,re:0.5})

s0.px.n.set('Dlyd%12..*16')
s0.px.modi.saw(1,10)
s0.py.harm.saw(0.5,3,0.25)

s0.x.saw()
s0.y.noise()

s0.e.every(1)
\`\`\`

The canvas can be used or ignored at will. If you don’t need to map parameters across space, you can use the \`.p\` property as normal. However, composing with four dimensions can be a useful way of managing complexity. For example, you could place the overall intensity of the piece on the z axis, and use the x and y axes to control the movement of individual streams.

As we shall see, plotting a stream's position in 3D space comes into its own when you start using Zen's quantum features.

## Grid
Alternatively, you can overwrite the stream positions on the canvas using \`z.grid\`. This is an instance of the Pattern class and expects a flat array of values between 0 and 1. Using the length of the array as the size of the grid, it will visualise the data that you send. For example:
\`\`\`js
z.grid.set(() => Array.from({length: 16*16}, () => Math.random()))
\`\`\`

Whilst this has no bearing on the sound, you can sonify this data elsewhere in your code. Potential uses are for cellular automata. The \`.persist()\` pattern method can be used to modify the grid over time, allowing you to create evolving patterns. 

Here's an example of the famous Game of Life:
\`\`\`js
z.q = 8
z.s = 16

// Create a new grid
const createGrid = size => Array(size).fill()
  .map(() => Array(size).fill()
  .map(() => Math.floor(Math.random() * 2)));

// Count the neighbours of a cell
const countNeighbours = (grid, x, y) => {
  return [-1, 0, 1].flatMap(dx =>
    [-1, 0, 1].map(dy => {
      if (dx === 0 && dy === 0) return 0;
      const newX = (x + dx + z.s) % z.s;
      const newY = (y + dy + z.s) % z.s;
      return grid[newX][newY] ? 1 : 0;
    })
  ).reduce((a, b) => a + b);
}

// Generate the next generation of the grid
const nextGeneration = grid => grid.map((row, x) =>
  row.map((cell, y) => {
    const neighbours = countNeighbours(grid, x, y);
    return (cell 
      ? neighbours === 2 || neighbours === 3 
      : neighbours === 3)
        ? 1
        : 0;
    })
);

// use the persist method to change previous iteration
z.grid.persist((_, last) => {
  const grid = last ? last : createGrid(z.s);
  return nextGeneration(grid);
});
\`\`\`
`