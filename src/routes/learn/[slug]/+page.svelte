<script>
    import { onMount, afterUpdate } from 'svelte';

    // Using ES6 import syntax
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';

    // Then register the languages you need
    import { marked } from "marked";
    import Icon from 'svelte-awesome';
    import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	
    export let data;

    onMount(() => hljs.registerLanguage('javascript', javascript));
    afterUpdate(() => hljs.highlightAll());
</script>

<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<section class="content">
    <div class="markdown">
        <div class="breadcrumb">
            <a href="/learn">Learn</a> <span>&gt; {data.chapter.title}</span>
        </div>
        {@html marked.parse(data.chapter.markdown)}
    </div>
    <nav class="pagination">
        <div class="pagination__prev">
            <a href="/learn/{data.prev?.slug || ''}">
                <span>
                    <Icon data="{faArrowLeft}" />
                </span>
                <p>{data.prev?.title || 'Learn'}</p>
            </a>
        </div>
        <div class="pagination__next">
            {#if data.next}
                <a href="/learn/{data.next.slug}">
                    <p>{data.next.title}</p>
                    <span>
                        <Icon data="{faArrowRight}" />        
                    </span>
                </a>
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
        max-width: 1200px;
        
        @media (min-width: 1200px){
            margin: 0 auto 2rem;
        }
    }

    .pagination {
        width: 100%;
        display: flex;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto 2rem;
        &__next, &__prev {
            width: 50%;
            span { 
                display: block;
                height: 100%;
                display: flex;
                align-items: center;
            }
            p { 
                margin: 0;
            }

            a {
                display: flex;
                align-items: center;
                gap: 1rem;
                &:hover {
                    color: var(--color-yellow);
                    text-decoration: none;
                }

            }
        }

        &__next {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
        }
    }
</style>