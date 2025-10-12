<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { showCircuit, toggleHelp } from '$lib/stores/zen';
    import { initElectronAPI, isApp } from '$lib/electronAPI';
    import { onMount } from 'svelte';
    import Tools from '$lib/components/Tools.svelte';

    import Notice from '$lib/components/Notice.svelte';
    import Canvas from '$lib/components/Canvas.svelte';

    import Help from '$lib/components/Help.svelte';

    onMount(() => {
        isApp() && initElectronAPI();
        window.addEventListener('click', startAudio);
        window.addEventListener('touchstart', startAudio);
        window.addEventListener('keydown', startAudio);
        window.addEventListener('keydown', (e) => {
            if(e.metaKey && e.key === 'h') {
                e.preventDefault();
                toggleHelp();
            }
        });
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
            <Console 
                fullHeight={!$showCircuit}
            />
        </div>

        {#if $showCircuit}
            <div class="circuit">
                <Circuit />
            </div>
        {/if}

        {#if !isApp()}
            <Notice />
        {/if}
    </section>
    <Canvas />

    <Help />
</main>

<style lang="scss">
    main {
        position: relative;
    }
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 5fr 3fr;
        grid-gap: 1.5rem;
        user-select: none;
        min-height: calc(100vh - 1.5rem);
        max-height: calc(100vh - 1.5rem);
        overflow: scroll;
        padding-bottom: 1.5rem;

        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 5fr 5fr;
        }

        @media all and (display-mode: fullscreen) {
            grid-template-columns: 1fr;
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
        grid-row: 2;
        position: relative;
        border-top: 1px solid var(--color-grey-light);
        padding: 1.5rem 0 0 0;
        
        @media (min-width: 800px) {
            grid-column: 2 / 3;
            grid-row: 1 / 3;
            border-top: 0;
            
            &--with-circuit {
                grid-row: 1 / 2;
                border-bottom: .25px solid var(--color-grey-light);
                padding: 1.5rem 0;
            }
            
        }

        @media all and (display-mode: fullscreen) {
            grid-column: 2 / 3;
            grid-row: 1 / 3;

            &--with-circuit {
                grid-row: 1 / 2;
                padding: 1.5rem 0;
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
</style>
