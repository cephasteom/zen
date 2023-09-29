<script lang="ts">
    import { onMount } from 'svelte';
    import { visualsData } from "$lib/stores/zen";

    let history: Uint8Array = new Uint8Array(0);
    let canvas: HTMLCanvasElement;
    let canvasCtx: CanvasRenderingContext2D | null;

    let s: number = 16;
    let px: number = 16;
    
    const isEqual = (data: Uint8Array, index: number) => {
        for(let i = index; i < index + 4; i++) {
            if(history[i] !== data[i]) return true;
        }
        return false
    }

    const drawCanvas = (data: Uint8Array) => {
        
        for(let i = 0; i < s*s; i++) {
            // TODO: fix this so we don't have to redraw every pixel
            // if(isEqual(data, i*4)) continue;
            const x = Math.floor((i % s) * px);
            const y = Math.floor(i / s) * px;
            const r = data[i*4];
            const g = data[i*4+1];
            const b = data[i*4+2];
            const a = data[i*4+3];
            canvasCtx && (canvasCtx.fillStyle = `rgba(${r},${g},${b},${a})`);
            canvasCtx?.fillRect(x, y, px, px);
        }

        history = data;
    }

    onMount(() => {
        canvasCtx = canvas.getContext('2d', { alpha: false });
        canvasCtx && (canvasCtx.fillStyle = "#262626");
        canvasCtx?.fillRect(0, 0, s*px, s*px);
        
        visualsData.subscribe(drawCanvas);
    })
</script>

<div class="visuals">
    <canvas bind:this={canvas} id="canvas" width={px * s} height={px * s}></canvas>
    
    <svg id="svg" width={px * s} height={px * s} viewBox={`0 0 ${px * s} ${px * s}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="smallGrid" width={px} height={px} patternUnits="userSpaceOnUse">
                <path d={`M ${px} 0 L 0 0 0 ${px}`} fill="none" stroke="var(--color-grey-dark)" stroke-width="0.5" />
            </pattern>
            <pattern id="grid" width={px * s - 0.25} height={px * s - 0.25} patternUnits="userSpaceOnUse">
                <rect width={px * s} height={px * s} fill="url(#smallGrid)" />
            </pattern>
        </defs>
        <rect width={px * s} height={px * s} fill="url(#grid)" />
    </svg>
</div>

<style lang="scss">
    .visuals {
        width: 80%;
        height: 0;
        padding-bottom: 80%;
        position: relative;
        & #canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        & #svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
        }
    }
</style>