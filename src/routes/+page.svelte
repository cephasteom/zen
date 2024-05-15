<script lang="ts">
    import Editor from '$lib/components/Editor/Editor.svelte';
    import Visuals from '$lib/components/Visuals/Visuals.svelte';
    import Circuit from '$lib/components/Circuit.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
    import Console from '$lib/components/Console.svelte';
    import { startAudio } from '$lib/zen/index';
    import { isQuantum } from '$lib/stores/zen';
    
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

<section 
    class="zen"
    class:zen--quantum={$isQuantum}    
>
    <div class="editor">
        <Editor />
    </div>
    
    <div class="tools">
        <Tools />
    </div>

    {#if $isQuantum}
        <div class="circuit">
            <Circuit />
        </div>
    {/if}
    
    <div 
        class="visuals"
        class:visuals--quantum={$isQuantum}
    >
        <Visuals />
    </div>

    <div 
        class="console"
        class:console--quantum={$isQuantum}
    >
        <Console />
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
        max-height: calc(100vh - 10rem);
        overflow: scroll;
        
        @media (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 8fr 3fr 1fr;
            
            &--quantum {
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 6fr 5fr 1fr;
            }
        }
        
        @media (min-width: 1200px) {
            grid-template-columns: 1fr 1fr;
            padding: 1rem 2rem;
            &--quantum {
                grid-template-columns: 2fr 1.5fr 1.5fr;
            }
        }

        @media all and (display-mode: fullscreen) {
            grid-template-columns: 2fr 3fr;
            grid-template-rows: 8fr 1fr 1fr;
            height: calc(100vh - 4rem);
            padding: 2rem;
        }
    }

    .editor {
        height: 100%;
        grid-column: 1;
        grid-row: 2;
        @media (min-width: 800px) {
            grid-column: 1;
            grid-row: 1 / 3;
        }
    }

    .tools {
        grid-column: 1;
        grid-row: 1;
        border-radius: 10px;

        @media (min-width: 800px) {
            grid-column: 1;
            grid-row: 3;
        }
        background: linear-gradient(45deg, var(--color-grey-light-mid), var(--color-grey-darker));
        padding: 1rem;
    }

    .circuit {
        grid-column: 2 / 4;
        grid-row: 2 / 4;
        border-radius: 10px;
        position: relative;
        display: none;

        @media (min-width: 800px) {
            display: block;
        }

        background-color: var(--color-grey-darker);
    }

    .visuals {
        grid-column: 2 / 3;
        grid-row: 1;

        &--quantum {
            grid-column: 3 / 4;
            grid-row: 1;
        }
        border-radius: 10px;
        position: relative;

        background: var(--color-grey-dark);

        display: none;

        @media (min-width: 800px) {
            display: block;
        }
    }

    .console {
        grid-column: 2 / 3;
        grid-row: 2 / 4;
        &--quantum {
            grid-column: 2 / 3;
            grid-row: 1;
        }
        border-radius: 10px;
        position: relative;

        background-color: var(--color-grey-dark);

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
