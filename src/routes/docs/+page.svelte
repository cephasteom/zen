<script lang="ts">
    import { onMount } from "svelte";
    import { parseTSDocsText } from "$lib/utils/parsing";

    let docs: any;

    onMount(() => {
        fetch("/docs/docs.json")
            .then((res) => res.json())
            .then((json) => docs = json)
            .then(() => console.log(docs.children[1]))
    });
</script>

<svelte:head>
	<title>Documentation</title>
	<meta name="description" content="Zen Documentation" />
</svelte:head>

<div class="content">
	<h1>Documentation</h1>
    <p>The following documentation provides a comprehensive list of all Zen variables, classes and methods. It is intended as a reference whilst using Zen. If you are new to Zen, we recommend that you follow the tutorial and load some code examples first.</p>

    <section class="variables">
        <h2>Variables</h2>
        <p>Zen exposes the following read-only variables:</p>
        <ul>
            <li><code class="inline-code">t</code> an integer representing time.</li>
            <li><code class="inline-code">q</code> the number of divisions per cycle. <code class="inline-code">t</code> increments <code class="inline-code">q</code> times per cycle.</li>
            <li><code class="inline-code">s</code> the size of the canvas.</li>
            <li><code class="inline-code">c</code> the current cycle.</li>
        </ul>
        <p><code class="inline-code">t</code>, <code class="inline-code">q</code>, and <code class="inline-code">s</code> can be manipulated using the Zen class <code class="inline-code">z</code>, see below.</p>
    </section>

    <section class="classes">
        <h2>Classes</h2>
        {#if docs}
            {#each docs.children.reverse() as section}
                <span class="quick-link"><a href="/docs#{section.name.toLowerCase()}">{section.name}</a></span>
            {/each}
            {#each docs.children as section}
                <div class="class">
                    <h3 id={section.name.toLowerCase()}>{section.name}</h3>
                    <p class="path">Defined in <a href={section.sources[0]?.url} target="_blank">{section.sources[0]?.fileName}</a></p>

                    {#if section.children}
                        {#each section.children as child}
                            <p>{@html parseTSDocsText(child.comment.summary)}</p>
                            {#each child.comment.blockTags as tag}
                                <span>{@html parseTSDocsText(tag.content)}</span>
                            {/each}
                            
                            {#if child.children}
                                {#each child.children as subChild}
                                    <h4>{subChild.name}</h4>
                                    <p class="path">Defined in <a href={subChild.sources[0]?.url} target="_blank">{subChild.sources[0]?.fileName}</a></p>
                                    {#if subChild.comment}
                                        <p>{@html parseTSDocsText(subChild.comment.summary)}</p>
                                        {#if subChild.comment.blockTags}
                                            {#each subChild.comment.blockTags as tag}
                                                <span>{@html parseTSDocsText(tag.content)}</span>
                                            {/each}
                                        {/if}
                                    {/if}

                                    {#if subChild.getSignature}
                                        <p>{@html parseTSDocsText(subChild.getSignature.comment.summary)}</p>
                                        {#if subChild.getSignature.comment.blockTags}
                                            {#each subChild.getSignature.comment.blockTags as tag}
                                                <span>{@html parseTSDocsText(tag.content)}</span>
                                            {/each}
                                        {/if}
                                    {/if}

                                    {#if subChild.setSignature}
                                        <p>{@html parseTSDocsText(subChild.setSignature.comment.summary)}</p>
                                        {#if subChild.setSignature.comment.blockTags}
                                            {#each subChild.setSignature.comment.blockTags as tag}
                                                <span>{@html parseTSDocsText(tag.content)}</span>
                                            {/each}
                                        {/if}
                                    {/if}

                                    {#if subChild.signatures}

                                        {#each subChild.signatures as signature}
                                            <p>{@html parseTSDocsText(signature.comment.summary)}</p>
                                            {#if signature.comment.blockTags}
                                                {#each signature.comment.blockTags as tag}
                                                    <span>{@html parseTSDocsText(tag.content)}</span>
                                                {/each}
                                            {/if}
                                        {/each}
                                    {/if}
                                {/each}
                            {/if}
                        {/each}
                    {/if}


                </div>
            {/each}
        {/if}
    </section>

</div>

<style lang="scss">
    .code {
        background-color: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }

    p, li {
        margin-top: 1rem;
    }

    .class {
        margin-bottom: 4rem;
    }

    .path {
        margin-top: 0.25rem;
        font-size: var(--text-xs);
    }

    .quick-link {
        margin-right: 1rem;
        &:hover {
            text-decoration: underline;
            color: var(--color-yellow)
        }
    }
</style>