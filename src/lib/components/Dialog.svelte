<script lang="ts">
    export let dialog: HTMLDialogElement;
</script>
<dialog bind:this={dialog} on:close>
    <slot/>
</dialog>

<style lang="scss">
    dialog {
        background-color: var(--color-grey-darkest);
        border: 1px solid var(--color-theme-3);
        border-radius: 0.25rem;
        box-shadow: 0 0 0.5rem var(--color-box-shadow);
        padding: 0.75rem 1rem;
        color: var(--color-yellow);
    }
</style>