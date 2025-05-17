<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { get } from 'svelte/store';
    import { min, calculateRectHeightAndWidth } from '$lib/zen/utils/utils';
    import { visualsData, gridData, canvasData, visualsType, s, showCircuit, isPlaying } from "$lib/stores/zen";
    import type { vector as v } from '$lib/zen/types';
    import "q5";

    let q: any;
    let size: number = 100;
    let container: HTMLElement;
    let handleResize: any;
    let gridSize = 16;

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
            q.strokeWeight(1/2);

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
                    q.push();
                    q.fill(Math.floor((1 - +value) * 256));
                    q.noStroke();
                    q.rect(posX, posY, squareSize, squareSize);
                    q.pop();
                }
            }
        }

        /**
         * Run q5.js script
        */
        function runScript(script: string) {
            try {
                new Function(...Object.keys(q), script)(...Object.values(q));
            } catch (error) {
                console.error("Error in q5.js script:", error);
            }
        }

        q.draw = () => {
            // if any stream has set a q5.js string, run it
            if($canvasData) return runScript($canvasData)
            
            q.clear()
            q.background(q.color(52,73,94))
            gridSize = get(s)
            const gridDataArray: number[] | number[][] = $gridData
            gridDataArray && gridDataArray.length
                ? gridMode(gridDataArray)
                : squareMode(get(visualsData))
        }

        q.setup = () => {
            q.createCanvas(size,size)
            q.colorMode(q.RGB, 255)
            handleResize = resize
            q.noLoop()
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

        return () => {
            unsubscribeVisualsType()
            unsubscribeShowCircuit()
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
    }
</style>