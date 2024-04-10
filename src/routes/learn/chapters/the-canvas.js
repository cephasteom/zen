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
`