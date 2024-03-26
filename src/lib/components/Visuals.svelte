<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import P5 from 'p5-svelte'
    import type { p5, Sketch } from 'p5-svelte';
    import { Vector } from 'p5';
    import { min } from '$lib/zen/utils/utils';
    import { visualsData } from "$lib/stores/zen";

    let container: HTMLElement;
    let p5Instance: p5;
    let handleResize: any;
    let draw: any;

    const sketch : Sketch = (p5: p5)=> {
        let size = 100;
        let radius = size / 3;

        const getSize = (): void => {
            const dimensions = container.getBoundingClientRect()
            size = min(dimensions.width, dimensions.height) - 50
            radius = size / 3;
        }

        const drawSphere = () => {
            p5.ambientMaterial(194);
            let c = p5.color('rgb(209, 206, 199)')
            
            c.setAlpha(50)
            p5.stroke(c)
            p5.noFill()
            p5.stroke('white')
            p5.strokeWeight(0.125)
            p5.sphere((radius) - 2, 20, 20);
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
            data.forEach((p, i) => {
                p5.push()
                const { phi, theta } = p
                const vector = Vector.fromAngles(p5.radians(theta * 180), p5.radians(phi * 180), radius)
                p5.stroke('white')
                p5.translate(vector.x, vector.y, vector.z)
                p5.sphere(4);
                p5.pop()

                // azimuth ring
                p5.push()
                p5.noFill()
                p5.stroke('#FF695A')
                p5.strokeWeight(4)
                p5.rotateY(p5.radians(90))
                p5.rotateY(p5.radians(phi * 180))
                p5.circle(0, 0, (radius * 2));
                p5.pop()

                // inclination ring
                p5.push()
                p5.noFill()
                p5.stroke('#E5007F')
                p5.strokeWeight(4)
                p5.rotateX(p5.radians(90))
                p5.translate(0, 0, -vector.y)
                p5.circle(0, 0, (p5.sin(p5.radians(theta * 180)) * radius * 2));
                p5.pop()
            })
        }
    }

    const handleInstance = (e: CustomEvent<p5>) => {
        p5Instance = e.detail
    }

    onMount(() => {
        visualsData.subscribe(data => {
            draw && draw()
        });
    })
</script>

<svelte:window on:resize={() => handleResize()} />

<div bind:this={container} class="visuals">
    <P5 {sketch} on:instance={handleInstance} />
</div>

<style lang="scss">
    .visuals {
        width: 100%;
        height: 100%;
        // max-height: 30rem;
        margin: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        & canvas {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
</style>