<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Visuals from '$lib/components/Visuals/Visuals.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showCircuit, showVisuals } from '$lib/stores/zen';
    import { initElectronAPI, isApp } from '$lib/electronAPI';
    import { onMount } from 'svelte';

    onMount(() => {
        isApp() && initElectronAPI();
        window.addEventListener('click', startAudio);
        window.addEventListener('touchstart', startAudio);
        window.addEventListener('keydown', startAudio);
    });
</script>

<svelte:head>
	<title>Zen</title>
	<meta name="description" content="A musical live coding language that runs in your browser" />
</svelte:head>

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
        min-height: calc(100vh - 56px - 2rem);
        max-height: calc(100vh - 56px - 2rem);
        overflow: scroll;
        
        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 6fr 2fr 1fr 1fr;
        }
        
        @media (min-width: 1200px) {
            grid-template-columns: 1fr 1fr;
            padding: 1rem;
        }

        @media all and (display-mode: fullscreen) {
            grid-template-columns: 1fr 1fr;
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
        border-radius: 5px;
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
        border-radius: 5px;
        background: var(--color-grey-darker);
        padding: 1rem;

        @media (min-width: 800px) {
            grid-column: 2;
            grid-row: 4;
        }
    }

    .circuit {
        grid-column: 2;
        grid-row: 2 / 4;
        border-radius: 5px;
        position: relative;
        display: none;
        overflow: hidden;
        background-color: var(--color-grey-darker);

        &--fullHeight {
            grid-row: 1 / 4;
        }

        @media (min-width: 800px) {
            display: block;
        }

    }

    .visuals {
        grid-column: 2 / 3;
        grid-row: 1 / 4;
        border-radius: 5px;
        position: relative;
        background: var(--color-grey-dark);
        display: none;
        
        &--withCircuit {
            grid-row: 1 / 2;
        }

        @media (min-width: 800px) {
            display: block;
        }
    }

    .data {
        grid-column: 1;
        grid-row: 3;
        border-radius: 5px;
        background-color: var(--color-grey-dark);
        padding: 1rem;

        @media (min-width: 800px) {
            display: none;
            grid-column: 2;
            grid-row: 2;
        }
    }
</style>
