<script>
    import Editor from '$lib/components/Editor.svelte';
    import Visuals from '$lib/components/Visuals.svelte';
    import Data from '$lib/components/Data.svelte';
    import Tools from '$lib/components/Tools.svelte';
</script>

<svelte:head>
	<title>Zen</title>
	<meta name="description" content="Zen" />
</svelte:head>

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
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 6fr 1fr 1fr;
        grid-gap: 1rem;
        padding: 1rem;
        
        @media (min-width: 500px) {
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
        grid-row: 1;
        @media (min-width: 500px) {
            grid-column: 1;
            grid-row: 1;
        }
    }

    .tools {
        grid-column: 1;
        grid-row: 2;
        @media (min-width: 500px) {
            grid-column: 1;
            grid-row: 2;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }

    .visuals {
        display: none;
        @media (min-width: 500px) {
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
        @media (min-width: 500px) {
            grid-column: 2;
            grid-row: 2;
        }
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }
</style>
