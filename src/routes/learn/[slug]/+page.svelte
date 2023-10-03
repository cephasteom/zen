<script>
    import { marked } from "marked";
	export let data;
    const { markdown } = data.chapter;
    const next = data.next?.slug;
    const prev = data.prev?.slug;
</script>

<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div>
        {@html marked.parse(markdown)}
    </div>
    <nav>
        {#if prev}
            <a href="/learn/{prev}">Previous</a>
        {/if}
        {#if next}
            <a href="/learn/{next}">Next</a>
        {/if}
    </nav>
</section>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
</style>