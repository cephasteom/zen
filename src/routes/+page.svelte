<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Data from '$lib/components/Data.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showCircuit } from '$lib/stores/zen';
    import { initElectronAPI, isApp } from '$lib/electronAPI';
    import { onMount } from 'svelte';
    import Tools from '$lib/components/Tools.svelte';

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

<Tools />
<main>
    <section class="zen container">
        <div 
            class="editor"
            class:editor--with-circuit={$showCircuit}
        >
            <Editor />
        </div>

        <div 
            class="console"
            class:console--with-circuit={$showCircuit}
        >
            <Console />
        </div>

        {#if $showCircuit}
            <div class="circuit">
                <Circuit />
            </div>
        {/if}

        <div class="data">
            <Data />
        </div>

        <Notice />
    </section>
</main>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 5fr 3fr 1fr;
        grid-gap: 1.5rem;
        user-select: none;
        min-height: calc(100vh - 2px);
        max-height: calc(100vh - 2px);
        overflow: scroll;

        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 5fr 5fr;
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
            grid-row: 1 / 3;
        }

    }
    
    .console {
        grid-column: 1 / 2;
        grid-row: 2 / 4;
        position: relative;
        
        @media (min-width: 800px) {
            grid-column: 2 / 3;
            grid-row: 1 / 3;
            border-top: 0;
            
            &--with-circuit {
                grid-row: 1 / 2;
                border-bottom: 0.5px solid var(--color-grey-light);
            }
        }

        @media all and (display-mode: fullscreen) {
            grid-column: 2 / 3;
            grid-row: 1 / 3;

            &--with-circuit {
                grid-row: 1 / 2;
            }
        }
    }

    .circuit {
        grid-column: 2;
        grid-row: 2 / 3;
        position: relative;
        display: none;
        overflow: auto;

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
