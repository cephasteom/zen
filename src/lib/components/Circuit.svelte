<script lang="ts">
    import { gates } from "$lib/stores/zen";
    import { onMount } from "svelte";
    import Gate from "./Gate.svelte";
    
    onMount(() => {
        gates.subscribe((value) => {
            console.log(value);
        });
    });
</script>

<div class="circuit">
    {#each $gates as row, i}
        <div class="row">
            <div 
                    class="col"
                    style="grid-column: 1;"
            >
                <p class="label">
                    <span class="label__state">|0⟩</span>
                    <span class="label__stream">s{i}</span>
                </p>
            </div>
            {#each row as cell, i}
                <div 
                    class="col"
                    style="grid-column: {i + 2};"
                >
                    <span class="wire"/>
                    {#if cell}
                        <Gate
                            type={cell.name}
                            params={cell.options.params}
                        />
                    {/if}
                </div>
            {/each}
            <div 
                    class="col"
                    style="grid-column: 9;"
            >
                <p class="label">
                    <span class="label__output">|0⟩</span>
                </p>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .circuit {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(8, 1fr);
        width: 100%;
        height: calc(100% - 2rem);
        border-radius: 10px;
        padding: 2rem;
        overflow-x: scroll;
        position: relative;
    }

    .row {
        // display: grid;
        // grid-template-columns: 0.25fr repeat(7, 1fr) 0.25fr;
        // grid-template-rows: 1fr;
        display: flex;
        width: 100%;
    }

    .col {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 4rem;
    }

    .label {
        margin: 0;
        display: flex;
        position: relative;
        color: var(--color-theme-1);
        &__stream {
            font-size: 0.75rem;
            position: absolute;
            right: -1.25rem;
            top: -0.5rem;
        }

        &__output {
            margin-left: 0.3rem;
            border-left: 1px solid white;
        }
    }

    .wire {
        width: 100%;
        height: 1px;
        background-color: var(--color-theme-1);
    }
</style>

