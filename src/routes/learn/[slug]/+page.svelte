<script>
    import { marked } from "marked";
    import Icon from 'svelte-awesome';
    import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	
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
    <div class="markdown">
        {@html marked.parse(markdown)}
    </div>
    <nav class="pagination">
        <div class="pagination__prev">
            {#if prev}
                <a href="/learn/{prev}">
                    <Icon data="{faArrowLeft}" />
                </a>
            {/if}
        </div>
        <div class="pagination__next">
            {#if next}
                <a href="/learn/{next}">
                    <Icon data="{faArrowRight}" />        
                </a>
            {/if}
        </div>
    </nav>
</section>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .markdown {
        margin-bottom: 2rem;
    }

    .pagination {
        width: 100%;
        display: flex;
        justify-content: space-between;
        &__next, &__prev {
            width: 2rem;
        }
    }
</style>