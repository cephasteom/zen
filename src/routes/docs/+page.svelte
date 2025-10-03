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
    <div class="content__inner">
        <h1>Docs</h1>
        <nav>
            <ul>
                {#each chapters as {slug,title}}
                    <a href={'/docs/' + slug} class="chapter"><li>{title}</li></a>
                {/each}
            </ul>
        </nav>
    </div>
</section>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: calc(100vh - 72px - 2rem - 67.5px);
        &__inner {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            height: 100%;
        }
    }
    ul {
        padding: 2rem 0;
        
        @media (min-width: 798px) {
            display: flex;
            flex-direction: column;   /* stack vertically */
            flex-wrap: wrap;          /* allow wrapping into a second column */
            max-height: 20rem;        /* controls when wrapping happens */
            list-style: none;
        }

        & li {
            flex: 0 0 auto; /* don’t stretch items */
        }
        
        & a {
            text-decoration: none;
            color: var(--color-yellow);
            &:hover {
                color: var(--color-theme-1);
            }
        }
    }

</style>
