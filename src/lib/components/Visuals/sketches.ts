import type { p5, Sketch } from 'p5-svelte';
import { min } from '../../zen/utils/utils';

export const sphere : (container: HTMLElement) => Sketch = (container: HTMLElement) => (p5: p5) => {
    let size = 100;
    let radius = size * 0.4;

    const getSize = (): void => {
        const dimensions = container.getBoundingClientRect()
        size = min(dimensions.width, dimensions.height)
        radius = size * 0.4;
    }

    const drawSphere = () => {
        
        p5.push()
        
        p5.noFill()
        p5.stroke(185,185,185)
        p5.strokeWeight(1/8)
        p5.sphere((radius)*0.9, 20, 20);
        p5.pop()
    }

    const resize = () => {
        getSize()
        p5.resizeCanvas(size, size)
    }

    p5.setup = () => {
        getSize()
        p5.createCanvas(size, size, p5.WEBGL)
        p5.smooth()
        p5.noLoop()

        drawSphere()
  
        handleResize = resize
        draw = p5.draw
    }

    p5.draw = () => {
        const data = get(visualsData)
        p5.clear()
        drawSphere()
        data.forEach(p => {
            const { x: phi, y: theta, z: l, colour } = p
            const lambda = Math.abs(1 - l)
            const vector = Vector.fromAngles(
                p5.radians(theta * 180), 
                p5.radians(phi * 180), 
                radius * lambda
            )

            // azimuth ring
            p5.push()
            p5.noFill()
            p5.stroke(colour)
            p5.strokeWeight(3)
            p5.rotateY(p5.radians(90))
            p5.rotateY(p5.radians(phi * 180))
            p5.circle(0, 0, ((radius * lambda) * 2));
            p5.pop()

            // inclination ring
            p5.push()
            p5.noFill()
            p5.stroke(colour)
            p5.strokeWeight(3)
            p5.rotateX(p5.radians(90))
            p5.translate(0, 0, -vector.y)
            p5.circle(0, 0, p5.sin(p5.radians(theta * 180)) * ((radius * lambda) * 2));
            p5.pop()

            // point
            p5.push()
            p5.translate(vector.x, vector.y, vector.z)
            p5.stroke(colour)
            p5.strokeWeight(p.weight * 30)
            p5.circle(0,0,1);
            p5.pop()
        })
    }
}