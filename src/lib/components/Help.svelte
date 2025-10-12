<script lang="ts">
    import { showHelp } from '$lib/stores/zen';
</script>

{#if $showHelp}
    <aside>
        <iframe 
            src="/docs/modules.html" 
            style="width: 100%; height: 100%; border: none;"
            title="Zen Documentation"
        ></iframe>
    </aside>
{/if}

<style lang="scss">
    aside {
        width: 100vw;

        @media (min-width: 800px) {
            width: 50vw;
        }
        height: 100vh;
        position: absolute;
        right: 0;
        top: 0;

    }
    h2 {
        margin-top: 0;
        color: var(--color-primary);
    }
</style>