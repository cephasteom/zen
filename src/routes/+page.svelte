<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Visuals from '$lib/components/Visuals/Visuals.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Data from '$lib/components/Data.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showCircuit, showVisuals } from '$lib/stores/zen';
    import { initElectronAPI, isApp } from '$lib/electronAPI';
    import { onMount } from 'svelte';

    import Notice from '$lib/components/Notice.svelte';

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

    <Notice />
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 5fr 3fr 1fr;
        grid-gap: 0.5px;
        user-select: none;
        min-height: calc(100vh - 2px);
        max-height: calc(100vh - 2px);
        overflow: scroll;

        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 6fr 4fr;
        }

        @media all and (display-mode: fullscreen) {
            grid-template-columns: 1fr;
            min-height: 100vh;
            @media (min-width: 800px) {
                grid-template-columns: 1fr 1fr;
            }
        }
    }

    .editor {
        height: 100%;
        grid-column: 1;
        grid-row: 1;
        @media (min-width: 800px) {
            grid-column: 1;
            grid-row: 1 / 2;

            &--large {
                grid-row: 1 / 3;
            }
        }

        @media all and (display-mode: fullscreen) {
            grid-row: 1 / 2;
            &--large {
                grid-row: 1 / 3;
            }
        }

    }
    
    .console {
        grid-column: 1 / 2;
        grid-row: 2 / 4;
        position: relative;
        background-color: var(--color-grey-dark);

        @media (min-width: 800px) {
            display: block;
            grid-row: 2 / 3;
            &--large {
                grid-column: 2 / 3;
                grid-row: 1 / 3;
            }
        }

        @media all and (display-mode: fullscreen) {
            grid-row: 2 / 3;
            &--large {
                grid-column: 2 / 3;
                grid-row: 1 / 3;
            }
        }
    }    

    .tools {
        display: none;
        
        @media (min-width: 800px) {
            background: var(--color-grey-darker);
            grid-column: 2;
            grid-row: 4;
            display: block;
        }

        @media all and (display-mode: fullscreen) {
            display: none;
        }
    }

    .circuit {
        grid-column: 2;
        grid-row: 2 / 3;
        position: relative;
        display: none;
        overflow: hidden;
        background-color: var(--color-grey-dark);
        padding: 0 1rem;
        
        &--fullHeight {
            grid-row: 1 / 3;
        }

        @media (min-width: 800px) {
            display: block;
        }

    }

    .visuals {
        grid-column: 2 / 3;
        grid-row: 1 / 3;
        position: relative;
        background-image: linear-gradient(135deg, var(--color-grey-dark), #8a7972);
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
        background-color: var(--color-grey-dark);
        padding: 1rem;
        display: none;

        @media (min-width: 800px) {
            display: none;
            grid-column: 2;
            grid-row: 2;
        }
    }
</style>
