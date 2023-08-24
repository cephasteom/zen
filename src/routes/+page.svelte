<script lang="ts">
    import Editor from '$lib/components/Editor.svelte';
    import Visuals from '$lib/components/Visuals.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showDocs } from '$lib/stores/app';
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
    <div class="visuals">
        <Visuals />
    </div>
    <div class="data">
        <Data />
    </div>
    <div class="docs" style:display={$showDocs ? 'flex' : 'none'}>
        <iframe title="docs" src="docs/?content=true" frameborder="0"></iframe>
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
        
        @media (min-width: 600px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 11fr 1fr;
        }
        
        @media (min-width: 1200px) {
            padding: 1rem 2rem;
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

    .visuals, .docs {
        display: none;
        @media (min-width: 600px) {
            grid-column: 2;
            grid-row: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
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

    .docs {
        display: none;
        & iframe {
            width: 100%;
            height: 100%;
        }
        z-index: 1000;
    }
</style>
