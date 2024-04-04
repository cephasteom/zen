<script lang="ts">
    let rows = [0,1,2,3,4,5,6,7]
    let cols = [0,1,2,3,4,5,6,7]
</script>

<div class="circuit">
    {#each rows as row}
        <div class="row">
            {#each cols as col, i}
                <div 
                    class="col"
                    style="grid-column: {i + 1};"
                >
                    <span class="wire"></span>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
    .circuit {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(8, 1fr);
        background-color: #333;
        border: 1px solid #333;
        width: 100%;
        height: 100%;
        border-radius: 10px;
    }

    .row {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: 1fr;
    }

    .col {
        display: flex;
        align-items: center;
    }

    .wire {
        width: 100%;
        height: 2px;
        background-color: var(--color-theme-1);
    }
</style>

