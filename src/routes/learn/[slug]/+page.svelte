<script>
    import { marked } from "marked";
    import Icon from 'svelte-awesome';
    import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	
    export let data;
    let { chapter, next, prev } = data;

</script>

<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div class="markdown">
        {@html marked.parse(chapter.markdown)}
    </div>
    <nav class="pagination">
        <div class="pagination__prev">
                <a href="/learn/{prev?.slug || ''}">
                    <span>
                        <Icon data="{faArrowLeft}" />
                    </span>
                </a>
                <p>{prev?.title || 'Home'}</p>
        </div>
        <div class="pagination__next">
            {#if next}
                <a href="/learn/{next.slug}">
                    <span>
                        <Icon data="{faArrowRight}" />        
                    </span>
                </a>
                <p>{next.title}</p>
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
            width: 50%;
            span { 
                display: block;
                width: 2rem ;
            }
            p { margin: 0}
        }

        &__next {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
        }
    }
</style>