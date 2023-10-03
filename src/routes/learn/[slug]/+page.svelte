<script>
    import { marked } from "marked";
    import Icon from 'svelte-awesome';
    import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	
    export let data;
</script>

<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div class="markdown">
        {@html marked.parse(data.chapter.markdown)}
    </div>
    <nav class="pagination">
        <div class="pagination__prev">
            {#if data.prev}
                <a href="/learn/{data.prev?.slug}">
                    <Icon data="{faArrowLeft}" />
                </a>
            {/if}
        </div>
        <div class="pagination__next">
            {#if data.next}
                <a href="/learn/{data.next?.slug}">
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