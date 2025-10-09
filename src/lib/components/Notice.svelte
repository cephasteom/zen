<script lang="ts">
    import { onMount } from 'svelte';
    import Dialog from './Dialog.svelte';
    
    let notice: HTMLDialogElement;

    function onClose() {
        localStorage.setItem('z.zen5-notice-shown', 'true');
        notice.close();
    }

    onMount(() => {
        if(!localStorage.getItem('z.zen5-notice-shown')) {
            notice.showModal();
        }
    });

</script>

<Dialog bind:dialog={notice} on:close={onClose}>
    <div>
        <h2>Zen 5 is here!</h2>
        <p>Zen 5 is a major update with a new user interface, features, improved performance, and simplified syntax.</p>
        <p>You can read about what's changed in the <a href="/changelog">release notes</a>.</p>
        <p>Since Zen 4 scripts will not work as expected, you can continue to use <a href="https://zen4.cephasteom.co.uk">zen4.cephasteom.co.uk</a>, or see <a href="https://github.com/cephasteom/zen-electron">github.com/cephasteom/zen-electron</a> for historical desktop app releases.</p>
    </div>
</Dialog>

<style>
    div {
        padding: 1rem 2rem;
    }
    h2 {
        margin-top: 0;
        color: var(--color-primary);
    }
</style>