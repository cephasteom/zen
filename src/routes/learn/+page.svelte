<script lang="ts">
    import { chapters } from './chapters';
</script>

<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div class="content__inner">
        <h1>Learn</h1>
        <nav>
            <ul>
                {#each chapters as {slug,title}}
                    <a href={'/learn/' + slug} class="chapter"><li>{title}</li></a>
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
        &__inner {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            height: 100%;
        }
    }
    ul {
        padding: 2rem 0;
        & a {
            // width: 50%;
            text-decoration: none;
            &:hover {
                color: var(--color-theme-1);
            }
        }
    }

</style>
