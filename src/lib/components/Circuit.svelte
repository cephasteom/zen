<script lang="ts">
    import { gates, measurements, inputs } from "$lib/stores/zen";
    import { circuit } from '$lib/zen/classes/Circuit'
    import { code } from '$lib/zen';
    import { onMount } from "svelte";

    let svg = '';
    let thisSvg: HTMLDivElement;

    onMount(() => {
        const unsubscribeCode = code.subscribe(() => {
            svg = circuit.gates.flat().length > 0
                ? circuit.exportSVG()
                : '';
        });

        return () => {
            unsubscribeCode();
        }
    });

</script>

<div 
    class="circuit"
>
    <div class="circuit__wires">
        {#each $gates as _, row}
            {#if $inputs[row] !== undefined && $measurements[row] !== undefined}
                <div class="row">
                    <div class="col col--first">
                        <p class="label">
                            <span class="label__state">|{$inputs[row]}⟩</span>
                        </p>
                    </div>
                    <div class="row__wire"></div>
                    <div 
                        class="col col--last"
                    >
                        <p class="label">
                            <span class="label__output">|{$measurements[row]}⟩</span>
                        </p>
                    </div>
                </div>
            {/if}
        {/each}
    </div>
    <div 
        bind:this={thisSvg}
        class="circuit__svg"
    >
        {@html svg}
    </div>
</div>

<style lang="scss">
    .circuit {
        width: 100%;
        height: calc(100% - 1.5rem);
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 5rem;
            pointer-events: none;
            z-index:10;
        }

        &__svg {
            position: absolute;
            top: 0;
            display: block;
            overflow-x: auto;
            margin-left: 2.1rem;
            
            @media (min-width: 1200px) {
                max-width: calc(50vw - 6.25rem);
            }

            @media all and (display-mode: fullscreen) {
                max-width: calc(((100vw/5) * 3) - 10rem);
            }
        }

        &__wires {
            position: absolute;
            top: -1.63rem;
            left: 0rem;
            right: 0rem;
        }
    }

    .row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 3.7rem;

        &__wire {
            height: 2px;
            background-color: var(--color-white);
            width: calc(100% - 4rem);
            margin-top: 2.71rem;
            margin-left:0.2rem;
        }
    }

    .label {
        color: var(--color-white);
        margin-top: 2em;
        font-size: var(--text-sm);
        transform: translateY(-1px);
    }
</style>

