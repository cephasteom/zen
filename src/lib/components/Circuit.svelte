<script lang="ts">
    import { onMount } from 'svelte';
    import { t } from '$lib/stores/zen'
    import { circuit } from '$lib/zen/classes/Circuit';
    
    let thisSvg: HTMLDivElement | null = null;
    let svg: string = "";

    onMount(() => {
        t.subscribe((value) => {
            svg = circuit.exportSVG(true)
        });
    });
</script>

<div 
    class="circuit"
>
    {#if svg}
        <div 
            bind:this={thisSvg}
            class="circuit-svg"
        >
            {@html svg}
        </div>
    {/if}
</div>

<style lang="scss">
    .circuit {
        width: calc(100% - 4rem);
        height: 100%;
        border-radius: 10px;
        padding: 0rem 2rem;
        overflow: scroll;
        position: relative;
        span {
            
        }

    }

    
</style>

