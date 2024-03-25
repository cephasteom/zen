<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Visuals from '$lib/components/Visuals.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { isDrawing } from '$lib/stores/zen';
</script>

<svelte:head>
	<title>Zen | App</title>
	<meta name="description" content="A musical live coding language that runs in your browser" />
</svelte:head>

<svelte:window 
    on:click={startAudio} 
    on:touchstart={startAudio}
    on:keydown={startAudio}
/>

<section class="zen">
    <div class="editor">
        <Editor />
    </div>
    <div class="tools">
        <Tools />
    </div>
    <div class="info">
        {#if $isDrawing}
            <Visuals />
        {:else}
            <Console />
        {/if}
    </div>
    <div class="data">
        <Data />
    </div>
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 6fr 1fr;
        grid-gap: 1rem;
        padding: 1rem;
        user-select: none;
        min-height: calc(100vh - 10rem);
        
        @media (min-width: 600px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 11fr 1fr;
        }
        
        @media (min-width: 1200px) {
            padding: 1rem 2rem;
        }

        @media all and (display-mode: fullscreen) {
            height: calc(100vh - 4rem);
            padding: 2rem;
            grid-template-columns: 2fr 3fr;
        }
    }

    .editor {
        height: 100%;
        grid-column: 1;
        grid-row: 2;
        @media (min-width: 600px) {
            grid-column: 1;
            grid-row: 1;
        }
    }

    .tools {
        grid-column: 1;
        grid-row: 1;
        @media (min-width: 600px) {
            grid-column: 1;
            grid-row: 2;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }

    .info {
        display: none;
        position: relative;
        @media (min-width: 600px) {
            grid-column: 2;
            grid-row: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        background-color: var(--color-grey-dark);
    }

    .data {
        grid-column: 1;
        grid-row: 3;
        @media (min-width: 600px) {
            grid-column: 2;
            grid-row: 2;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }
</style>
