<script lang="ts">
    let rows = [0,1,2,3,4,5,6,7]
    let cols = [0,1,2,3,4,5,6]
</script>

<div class="circuit">
    {#each rows as row, i}
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
            {#each cols as col, i}
                <div 
                    class="col"
                    style="grid-column: {i + 2};"
                >
                    <span class="wire"></span>
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
    }

    .row {
        display: grid;
        grid-template-columns: 0.25fr repeat(7, 1fr) 0.25fr;
        grid-template-rows: 1fr;
    }

    .col {
        display: flex;
        align-items: center;
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
        }
    }

    .wire {
        width: 100%;
        height: 1px;
        background-color: var(--color-theme-1);
    }
</style>

