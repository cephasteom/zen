<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Visuals from '$lib/components/Visuals/Visuals.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showCircuit, showVisuals } from '$lib/stores/zen';
    
</script>

<svelte:head>
	<title>Zenq</title>
	<meta name="description" content="A musical live coding language that runs in your browser" />
</svelte:head>

<svelte:window 
    on:click={startAudio} 
    on:touchstart={startAudio}
    on:keydown={startAudio}
/>

<section class="zen">
    <div 
        class="editor"
        class:editor--large={!$showCircuit && !$showVisuals}
    >
        <Editor />
    </div>

    <div 
        class="console"
        class:console--large={!$showCircuit && !$showVisuals}
    >
        <Console />
    </div>
    
    <div class="tools">
        <Tools />
    </div>

    {#if $showCircuit}
        <div 
            class="circuit"
            class:circuit--fullHeight={!$showVisuals}
        >
            <Circuit />
        </div>
    {/if}
    
    {#if $showVisuals}
        <div 
            class="visuals"
            class:visuals--withCircuit={$showCircuit}
        >
            <Visuals />
        </div>
    {/if}

    <div class="data">
        <Data />
    </div>
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 8fr 1fr;
        grid-gap: 1rem;
        padding: 1rem;
        user-select: none;
        min-height: calc(100vh - 10rem);
        max-height: calc(100vh - 10rem);
        overflow: scroll;
        
        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 6fr 2fr 3fr 1fr;
        }
        
        @media (min-width: 1200px) {
            grid-template-columns: 1fr 1fr;
            padding: 1rem 2rem;
        }

        @media all and (display-mode: fullscreen) {
            grid-template-columns: 1fr 1.5fr;
            min-height: calc(100vh - 6rem);
            padding: 1rem;
        }
    }

    .editor {
        height: 100%;
        grid-column: 1;
        grid-row: 2;
        @media (min-width: 800px) {
            grid-column: 1;
            grid-row: 1 / 3;

            &--large {
                grid-row: 1 / 5;
            }
        }

    }
    
    .console {
        grid-column: 1 / 2;
        grid-row: 3 / 5;
        border-radius: 10px;
        position: relative;
        background-color: var(--color-grey-dark);
        display: none;

        &--large {
            grid-column: 2 / 3;
            grid-row: 1 / 4;
        }

        @media (min-width: 800px) {
            display: block;
        }
    }    

    .tools {
        grid-column: 1;
        grid-row: 1;
        border-radius: 10px;

        @media (min-width: 800px) {
            grid-column: 2;
            grid-row: 4;
        }
        background: linear-gradient(45deg, var(--color-grey-light-mid), var(--color-grey-darker));
        padding: 1rem;
    }

    .circuit {
        grid-column: 2;
        grid-row: 2 / 4;
        border-radius: 10px;
        position: relative;
        display: none;

        &--fullHeight {
            grid-row: 1 / 4;
        }

        @media (min-width: 800px) {
            display: block;
        }

        background-color: var(--color-grey-darker);
    }

    .visuals {
        grid-column: 2 / 3;
        grid-row: 1 / 4;

        &--withCircuit {
            grid-row: 1 / 2;
        }
        border-radius: 10px;
        position: relative;

        background: var(--color-grey-dark);

        display: none;

        @media (min-width: 800px) {
            display: block;
        }
    }

    

    .data {
        grid-column: 1;
        grid-row: 3;
        border-radius: 10px;

        @media (min-width: 800px) {
            display: none;
            grid-column: 2;
            grid-row: 2;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }
</style>
