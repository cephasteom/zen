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
    <div 
        bind:this={thisSvg}
        class="circuit__svg"
    >
        {@html svg}
    </div>
    <!-- <div class="circuit__wires">
        {#each $gates as gates, row}
            <div class="row">
                <div class="col col--first">
                    <p class="label">
                        <span class="label__state">|{$inputs[row]}⟩</span>
                        <span class="label__stream">s{row}</span>
                    </p>
                </div>

                <div 
                    class="col col--last"
                >
                    <p class="label">
                        <span class="label__output">|{$measurements[row]}⟩</span>
                    </p>
                </div>
            </div>
        {/each}
    </div> -->
</div>

<style lang="scss">
    .circuit {
        width: calc(100% - 4rem);
        height: calc(100% - 3rem);
        border-radius: 10px;
        padding: 1rem 2rem 2rem;
        overflow: auto; /* Enable scrolling */
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
            max-width: calc(50vw - 4rem);
            max-height: 100%;
            display: bloxk;
            overflow: scroll;
            
            @media (min-width: 1200px) {
                max-width: calc(50vw - 6rem);
            }
        }

        // &__wires {
        //     width: 100%;
        //     height: 100%;
        //     overflow-x: scroll;
        // }
    }

    // .row {
    //     display: flex;
    //     justify-content: space-between;
    //     width: 100%;
    //     min-height: 3rem;
    // }

    // .col {
    //     display: flex;
    //     align-items: center;
    //     justify-content: center;
    //     position: relative;
    //     width: 3rem;
    //     &--first {
    //         justify-content: flex-start;
    //     }

    //     &--last {
    //         justify-content: flex-end;
    //     }
    // }

    // .label {
    //     margin: 0;
    //     display: flex;
    //     position: relative;
    //     color: var(--color-theme-2);
    //     font-size: var(--text-sm);
    //     font-family: 'Lato Bold';
    //     &__stream {
    //         font-size: var(--text-xxs);

    //         position: absolute;
    //         right: -0.5rem;
    //         top: -0.5rem;
    //     }

    //     &__output {
    //         margin-left: 0.3rem;
    //     }
    // }


    // .gates {
    //     display: flex;
    //     width: 100%;
    //     overflow-x: scroll;
    //     position: relative;
    //     overflow: visible;
    //     & .col:first-of-type {
    //         margin-left: 1rem;
    //     }
    // }

    // .wire {
    //     width: 100%;
    //     height: 2px;
    //     background-color: var(--color-theme-2);
    //     position: absolute;
    //     top: calc(50% - 0.5px);
    //     z-index: 10;
    // }
</style>

