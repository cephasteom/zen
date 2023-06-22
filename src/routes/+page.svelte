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
    <div class="data">
        <Data />
    </div>
    <div class="visuals">
        <Visuals />
    </div>
    <div class="tools">
        <Tools />
    </div>
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 11fr 1fr;
        grid-gap: 1rem;
        padding: 1rem 2rem;
    }

    .editor {
        grid-column: 1;
        grid-row: 1;
        height: 100%;
    }

    .data {
        grid-column: 1;
        grid-row: 2;
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }

    .visuals {
        grid-column: 2;
        grid-row: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }

    .tools {
        grid-column: 2;
        grid-row: 2;
        background-color: var(--color-grey-dark);
        padding: 1rem;
    }
</style>
