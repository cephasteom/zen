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
        s = Math.sqrt(data.length / 4);
        
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
</div>

<style lang="scss">
    .visuals {
        width: 100%;
        height: 30rem;
        margin: 1rem;
        & #canvas {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
</style>