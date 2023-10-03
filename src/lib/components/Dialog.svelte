<script lang="ts">
    export let dialog: HTMLDialogElement;
</script>

<dialog 
    on:click={() => dialog?.close()}
    on:keydown|preventDefault|stopPropagation={(event) => {
        if (event.key === 'Escape') {
            dialog?.close();
        }
    }}
    bind:this={dialog} 
    on:close
>
    <div on:click|stopPropagation>
        <slot/>
    </div>
</dialog>

<style lang="scss">
    dialog {
        background-color: var(--color-grey-darkest);
        border: 1px solid var(--color-theme-3);
        border-radius: 0.25rem;
        box-shadow: 0 0 0.5rem var(--color-box-shadow);
        padding: 1rem 2rem;
        color: var(--color-yellow);
    }
</style>