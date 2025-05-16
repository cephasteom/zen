<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { get } from 'svelte/store';
    import { Vector } from 'p5';
    import { min, calculateRectHeightAndWidth } from '$lib/zen/utils/utils';
    import { visualsData, gridData, visualsType, s, showCircuit, isPlaying } from "$lib/stores/zen";
    import type { vector as v } from '$lib/zen/types';
    import "q5";

    // create instance of q5 and associate with an existing canvas
  
    let q: any;
    let size: number = 100;
    let container: HTMLElement;
    let handleResize: any;
    let handleDraw: any;
    let gridSize = 16; // TODO: replace with s

    // let sketch : Sketch = (p5: p5)=> {
    //     let size = 100;
    //     let radius = size * 0.4;

    //     const getSize = (): void => {
    //         if(!container) return
    //         const dimensions = container.getBoundingClientRect()
    //         size = min(dimensions.width, dimensions.height)
    //         radius = size * 0.4;
    //     }

    //     const drawSphere = () => {
    //         p5.push()
    //         p5.noFill()
    //         p5.stroke(185,185,185)
    //         p5.strokeWeight(1/2)
    //         p5.sphere(radius*0.85, 20, 20);
    //         p5.pop()
    //     }

    //     const drawSquare = () => {
    //         p5.push();
    //         p5.noFill();
    //         p5.stroke(255,255,255);
    //         p5.strokeWeight(1/2);

    //         const squareSize = (size / gridSize) * 0.9;
    //         const gridTotalSize = gridSize * squareSize;

    //         for (let i = 0; i < gridSize; i++) {
    //             for (let j = 0; j < gridSize; j++) {
    //                 p5.rect(i * squareSize - gridTotalSize / 2, j * squareSize - gridTotalSize / 2, squareSize, squareSize);
    //             }
    //         }

    //         p5.pop();
    //     }

    //     const resize = () => {
    //         getSize()
    //         p5.resizeCanvas(size, size)
    //     }

    //     p5.setup = () => {
    //         getSize()
    //         p5.createCanvas(size, size, p5.WEBGL)
    //         p5.smooth()
    //         p5.noLoop()

    //         get(visualsType) === 'sphere'
    //             ? drawSphere()
    //             : drawSquare()
      
    //         handleResize = resize
    //         draw = p5.draw
    //     }

    //     const sphereMode = (data: v[]) => {
    //         drawSphere()
    //         data.forEach((p: v) => {
    //             const { x: phi, y: theta, z: l, colour } = p
    //             const lambda = Math.abs(1 - l)
    //             const vector = Vector.fromAngles(
    //                 p5.radians(theta * 180), 
    //                 p5.radians(phi * 360),
    //                 radius * lambda
    //             )

    //             // azimuth ring
    //             p5.push()
    //             p5.noFill()
    //             p5.stroke(colour)
    //             p5.strokeWeight(3)
    //             p5.rotateY(p5.radians(90))
    //             p5.rotateY(p5.radians(phi * 360))
    //             p5.circle(0, 0, ((radius * lambda) * 2));
    //             p5.pop()

    //             // inclination ring
    //             p5.push()
    //             p5.noFill()
    //             p5.stroke(colour)
    //             p5.strokeWeight(3)
    //             p5.rotateX(p5.radians(90))
    //             p5.translate(0, 0, -vector.y)
    //             p5.circle(0, 0, p5.sin(p5.radians(theta * 180)) * ((radius * lambda) * 2));
    //             p5.pop()

    //             // point
    //             p5.push()
    //             p5.translate(vector.x, vector.y, vector.z)
    //             p5.stroke(colour)
    //             p5.strokeWeight(p.weight * 30)
    //             p5.circle(0,0,1);
    //             p5.pop()
    //         })

    //     }
        
    //     const squareMode = (data: v[]) => {
    //         drawSquare()
    //         const squareSize = (size / gridSize) * 0.9;
    //         const gridTotalSize = gridSize * squareSize;

    //         data.forEach((p: v) => {
    //             const { x, y, colour } = p
    //             // Calculate the position of the square in the grid
    //             const posX = Math.floor((x%1) * gridSize) * squareSize - gridTotalSize / 2;
    //             const posY = Math.floor((y%1) * gridSize) * squareSize - gridTotalSize / 2;

    //             // Draw the square
    //             p5.push();
    //             p5.fill(colour);
                
    //             p5.noStroke();
    //             p5.rect(posX, posY, squareSize, squareSize);
    //             p5.pop();
    //         })
    //     }

    //     const gridMode = (data: number[] | number[][]) => {
    //         const { width, height } = Array.isArray(data[0]) // if data is 3D array...
    //             ? { width: data[0].length, height: data.length } // ...use the first two dimensions
    //             : calculateRectHeightAndWidth(data.length) // ...otherwise, calculate the width and height of the grid

    //         const squareSize = (size / Math.max(width, height)) * 0.9;
    //         const gridTotalWidth = width * squareSize;
    //         const gridTotalHeight = height * squareSize;
            
    //         const gridData = Array.isArray(data[0]) ? data.flat() : data
            
    //         for (let i = 0; i < height; i++) {
    //             for (let j = 0; j < width; j++) {
    //                 const index = i * width + j;
    //                 if (index >= gridData.length) break; // Stop if we've processed all data
    //                 const value = gridData[index];
    //                 const posX = j * squareSize - gridTotalWidth / 2;
    //                 const posY = i * squareSize - gridTotalHeight / 2;
    //                 // Draw the square
    //                 p5.push();
    //                 p5.fill(Math.floor((1 - +value) * 256));
    //                 p5.noStroke();
    //                 p5.rect(posX, posY, squareSize, squareSize);
    //                 p5.pop();
    //             }
    //         }
    //     }

    //     p5.draw = () => {
    //         p5.clear()
    //         gridSize = get(s)
    //         const gridDataArray: number[] | number[][] = get(gridData)
    //         if(get(visualsType) === 'sphere') return sphereMode(get(visualsData))
    //         gridDataArray && gridDataArray.length
    //             ? gridMode(gridDataArray)
    //             : squareMode(get(visualsData))
            
    //     }
    // }

    const getSize = (): void => {
        if(!container) return
        const dimensions = container.getBoundingClientRect()
        size = min(dimensions.width, dimensions.height)
    }


    async function initQ5() {
        let i = 0
        getSize()
        // @ts-ignore
        q = await Q5.WebGPU('instance', container);
        
        const resize = () => {
            getSize()
            q.resizeCanvas(size, size)
        }

        const drawSquare = () => {
            q.push();
            q.noFill();
            q.stroke(255,255,255);
            q.strokeWeight(1/4);

            const squareSize = (size / gridSize) * 0.9;
            const gridTotalSize = gridSize * squareSize;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    q.rect(i * squareSize - gridTotalSize / 2, j * squareSize - gridTotalSize / 2, squareSize, squareSize);
                }
            }

            q.pop();
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
                q.push();
                q.fill(colour);
                
                q.noStroke();
                q.rect(posX, posY, squareSize, squareSize);
                q.pop();
            })
        }

        q.draw = () => {
            q.clear()
            q.background(q.color(52,73,94))
            gridSize = get(s)
            squareMode(get(visualsData))
        }

        q.setup = () => {
            q.createCanvas(size,size)
            q.colorMode(q.RGB, 255)
            handleResize = resize
        };        
    }

    onMount(() => {
        initQ5()

        isPlaying.subscribe(isPlaying => q && (isPlaying ? q.loop() : q.noLoop()))

        const unsubscribeVisualsType = visualsType.subscribe(async () => {
            await tick()
            handleResize && handleResize()
        });
        const unsubscribeShowCircuit = showCircuit.subscribe(async () => {
            await tick()
            handleResize && handleResize()
        });
        // const unsubscribeVisualsData = visualsData.subscribe(async () => {
        //     await tick()
        // });

        return () => {
            unsubscribeVisualsType()
            unsubscribeShowCircuit()
            // unsubscribeVisualsData()
        }
    })
</script>

<svelte:window on:resize={() => handleResize && handleResize()} />

<div bind:this={container} class="visuals" />

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