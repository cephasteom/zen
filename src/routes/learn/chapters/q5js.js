export default `
# Q5.js

Write Q5.js code to control visuals rendered on the canvas. See [https://q5js.org/home/](https://q5js.org/home/) for documentation and examples. Set the \`.canvas\` property on one or more streams to control their visual output.
\`\`\`js
s0.canvas.set(\`
  let size = 20, dx = width/size, dy = height/size;
  for (let x = 0; x < width; x += dx)
    for (let y = 0; y < height; y += dy) {
      stroke(noise((frameCount+(x*100))*.01)*100);
      strokeWeight(noise((frameCount+(y*100))*.01)*50);
      point(x - width/2, y - height/2);
    }
\`)
s0.e.set(1)
\`\`\`

Use stream parameters within your Q5.js code by prefixing them with \`#\`:
\`\`\`js
s0.canvas.set(\`
  stroke(255)
  strokeWeight(100)
  point(0, (height - (height/36) * (#n - 36)) - halfHeight)
\`)
s0.set({inst:0,cut:0})
s0.n.random(36,72).step(1)
s0.e.every(2)
s0.e.set(1)
\`\`\`

`