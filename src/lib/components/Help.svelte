<script lang="ts">
    import Dialog from './Dialog.svelte';
    
    // be able to open this dialog from outside
    export function open() {
        help.showModal();
    }

    let help: HTMLDialogElement;

</script>

<Dialog bind:dialog={help} on:close={() => help.close()}>
        <iframe 
            src="/docs/modules.html" 
            style="width: 100%; height: 80vh; border: none;"
            title="Zen Documentation"
        ></iframe>
</Dialog>

<style>
    div {
        width: 50vw;
    }
    h2 {
        margin-top: 0;
        color: var(--color-primary);
    }
</style>