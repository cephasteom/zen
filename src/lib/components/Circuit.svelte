<script lang="ts">
    import { gates, measurements } from "$lib/stores/zen";
    import Gate from "./Gate.svelte";

    const getConnectedRow = (currentRow: number, currentCol: number) => {
        const { name, connector } = $gates[currentRow][currentCol];
        for (let row = 0; row < $gates.length; row++) {
            if (row !== currentRow) {
                const gate = $gates[row][currentCol];
                if (gate && gate.name === name && connector - gate.connector === 1 ) {
                    return row;
                }
            }
        }
        return null;
    };
</script>

<div class="circuit">
    {#each $gates as gates, row}
        <div class="row">
            <div 
                    class="col"
                    style="grid-column: 1;"
            >
                <p class="label">
                    <span class="label__state">|0⟩</span>
                    <span class="label__stream">s{row}</span>
                </p>
            </div>
            <div class="gates">
                <span class="wire"/>

                {#each gates as gate, col}
                    <div 
                        class="col"
                    >
                        {#if gate}
                            <Gate
                                gate={gate}
                                row={row}
                                connectTo={getConnectedRow(row, col)}
                            />
                        {/if}
                    </div>
                {/each}
            </div>
            <div 
                class="col"
            >
                <p class="label">
                    <span class="label__output">|{$measurements[row]}⟩</span>
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
        width: calc(100% - 2rem);
        height: calc(100% - 2rem);
        border-radius: 10px;
        padding: 1rem;
        overflow-x: scroll;
        position: relative;
    }

    .row {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .col {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 3rem;
    }

    .label {
        margin: 0;
        display: flex;
        position: relative;
        color: var(--color-theme-1);
        font-size: var(--text-xs);
        &__stream {
            font-size: var(--text-xxs);

            position: absolute;
            right: -0.5rem;
            top: -0.5rem;
        }

        &__output {
            margin-left: 0.3rem;
        }
    }


    .gates {
        display: flex;
        width: 100%;
        overflow-x: scroll;
        position: relative;
        overflow: visible;
        & .col:first-of-type {
            margin-left: 1rem;
        }
    }

    .wire {
        width: 100%;
        height: 1px;
        background-color: var(--color-theme-1);
        position: absolute;
        top: calc(50% - 0.5px);
        z-index: 10;
    }
</style>

