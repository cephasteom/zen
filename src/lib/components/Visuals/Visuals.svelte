<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { get } from 'svelte/store';
    import P5Svelte from 'p5-svelte'
    import type { Sketch } from 'p5-svelte';
    import p5 from 'p5';
    import { min, calculateRectHeightAndWidth } from '$lib/zen/utils/utils';
    import { visualsData, gridData, visualsType, s, showCircuit } from "$lib/stores/zen";
    import type { vector as v } from '$lib/zen/types';

    let container: HTMLElement;
    let p5Instance: p5;
    let handleResize: any;
    let draw: any;
    let gridSize = 16; // TODO: replace with s

    let sketch : Sketch = (p5: p5)=> {
        let size = 100;
        let radius = size * 0.4;

        const getSize = (): void => {
            if(!container) return
            const dimensions = container.getBoundingClientRect()
            size = min(dimensions.width, dimensions.height)
            radius = size * 0.4;
        }

        const drawSphere = () => {
            p5.push()
            p5.noFill()
            p5.stroke(185,185,185)
            p5.strokeWeight(1/2)
            p5.sphere(radius*0.85, 20, 20);
            p5.pop()
        }

        const drawSquare = () => {
            p5.push();
            p5.noFill();
            p5.stroke(255,255,255);
            p5.strokeWeight(1/2);

            const squareSize = (size / gridSize) * 0.9;
            const gridTotalSize = gridSize * squareSize;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    p5.rect(i * squareSize - gridTotalSize / 2, j * squareSize - gridTotalSize / 2, squareSize, squareSize);
                }
            }

            p5.pop();
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

            get(visualsType) === 'sphere'
                ? drawSphere()
                : drawSquare()
      
            handleResize = resize
            draw = p5.draw
        }

        const sphereMode = (data: v[]) => {
            drawSphere()
            data.forEach((p: v) => {
                const { x: phi, y: theta, z: l, colour } = p
                const lambda = Math.abs(1 - l)
                const vector = p5.Vector.fromAngles(
                    p5.radians(theta * 180), 
                    p5.radians(phi * 360),
                    radius * lambda
                )

                // azimuth ring
                p5.push()
                p5.noFill()
                p5.stroke(colour)
                p5.strokeWeight(3)
                p5.rotateY(p5.radians(90))
                p5.rotateY(p5.radians(phi * 360))
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
        
        const squareMode = (data: v[]) => {
            drawSquare()
            const squareSize = (size / gridSize) * 0.9;
            const gridTotalSize = gridSize * squareSize;

            data.forEach((p: v) => {
                const { x, y, colour } = p
                // Calculate the position of the square in the grid
                const posX = Math.floor((x%1) * gridSize) * squareSize - gridTotalSize / 2;
                const posY = Math.floor((y%1) * gridSize) * squareSize - gridTotalSize / 2;

                // Draw the square
                p5.push();
                p5.fill(colour);
                
                p5.noStroke();
                p5.rect(posX, posY, squareSize, squareSize);
                p5.pop();
            })
        }

        const gridMode = (data: number[] | number[][]) => {
            const { width, height } = Array.isArray(data[0]) // if data is 3D array...
                ? { width: data[0].length, height: data.length } // ...use the first two dimensions
                : calculateRectHeightAndWidth(data.length) // ...otherwise, calculate the width and height of the grid

            const squareSize = (size / Math.max(width, height)) * 0.9;
            const gridTotalWidth = width * squareSize;
            const gridTotalHeight = height * squareSize;
            
            const gridData = Array.isArray(data[0]) ? data.flat() : data
            
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    const index = i * width + j;
                    if (index >= gridData.length) break; // Stop if we've processed all data
                    const value = gridData[index];
                    const posX = j * squareSize - gridTotalWidth / 2;
                    const posY = i * squareSize - gridTotalHeight / 2;
                    // Draw the square
                    p5.push();
                    p5.fill(Math.floor((1 - value) * 256));
                    p5.noStroke();
                    p5.rect(posX, posY, squareSize, squareSize);
                    p5.pop();
                }
            }
        }

        p5.draw = () => {
            p5.clear()
            gridSize = get(s)
            const gridDataArray = get(gridData)
            if(get(visualsType) === 'sphere') return sphereMode(get(visualsData))
            gridDataArray && gridDataArray.length
                ? gridMode(gridDataArray)
                : squareMode(get(visualsData))
            
        }
    }

    const handleInstance = (e: CustomEvent<p5>) => {
        p5Instance = e.detail
    }

    onMount(() => {
        const unsubscribeVisualsType = visualsType.subscribe(async () => {
            await tick()
            handleResize && handleResize()
            draw && draw()
        });
        const unsubscribeShowCircuit = showCircuit.subscribe(async () => {
            await tick()
            handleResize && handleResize()
            draw && draw()
        });
        const unsubscribeVisualsData = visualsData.subscribe(async (data) => {
            await tick()
            draw && draw()
        });

        return () => {
            unsubscribeVisualsType()
            unsubscribeShowCircuit()
            unsubscribeVisualsData()
        }
    })
</script>

<svelte:window on:resize={() => handleResize && handleResize()} />

<div bind:this={container} class="visuals">
    <P5Svelte {sketch} on:instance={handleInstance} />
</div>

<style lang="scss">
    .visuals {
        position: absolute;
        width: calc(100% - 4rem);
        height: calc(100% - 4rem);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        
        & canvas {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
</style>