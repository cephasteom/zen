<script>
    import { marked } from "marked";
    import Icon from 'svelte-awesome';
    import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
    import Docs from "$lib/components/Docs.svelte"
    export let data;
</script>

<svelte:head>
	<title>Zen | Docs</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div class="markdown">
        <div class="breadcrumb">
            <a href="/docs">Docs</a> <span>&gt; {data.chapter.title}</span>
        </div>
        <h1>{data.chapter.title}</h1>
        {#if data.chapter.data}
            <Docs json={data.chapter.data} />
        {/if}
    </div>
    <nav class="pagination">
        <div class="pagination__prev">
            <a href="/docs/{data.prev?.slug || ''}">
                <span>
                    <Icon data="{faArrowLeft}" />
                </span>
            </a>
            <p>{data.prev?.title || 'Docs'}</p>
        </div>
        <div class="pagination__next">
            {#if data.next}
                <a href="/docs/{data.next.slug}">
                    <span>
                        <Icon data="{faArrowRight}" />        
                    </span>
                </a>
                <p>{data.next.title}</p>
            {/if}
        </div>
    </nav>
</section>

<style lang="scss">
    .breadcrumb {
        margin-top: 1rem;
        & a:hover {
            color: var(--color-yellow);
        }
        & span {
            color: var(--color-yellow);
        }
    }
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