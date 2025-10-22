<script lang="ts">
    import { chapters } from './chapters';
</script>

<svelte:head>
	<title>Zen | Tutorial</title>
	<meta name="description" content="A tutorial on how to use Zen, for total beginners." />
</svelte:head>

<section class="content">
    <div class="content__inner">
        <h1>Tutorial</h1>
        <nav>
            <ul>
                {#each chapters as {slug,title}, i}
                    <li>{i+1}. <a href={'/tutorial/' + slug} class="chapter">{title}</a></li>
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
