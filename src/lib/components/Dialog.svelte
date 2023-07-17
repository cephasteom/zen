<script lang="ts">
    export let dialog: HTMLDialogElement;
</script>
<dialog bind:this={dialog} on:close>
    <slot/>
</dialog>