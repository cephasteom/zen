<script lang="ts">
    const chapters = [
        { title: "Classes", slug: "classes"},
        { title: "Synths", slug: "synths"},
        { title: "FX", slug: "fx"},
    ]
</script>

<svelte:head>
	<title>Zen | Docs</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <h1>Docs</h1>
    <nav>
        <ul>
            {#each chapters as {slug,title}}
                <a href={'/docs/' + slug} class="chapter"><li>{title}</li></a>
            {/each}
        </ul>
    </nav>
</section>

<style lang="scss">
    ul {
        padding: 0;
        & a {
            text-decoration: none;
            &:hover {
                color: var(--color-theme-1);
            }
        }
    }

</style>
