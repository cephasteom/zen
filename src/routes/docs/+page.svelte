<!-- TODO: Midi, Oto -->

<script lang="ts">
    import { onMount } from "svelte";
    import { parseTSDocsText } from "$lib/utils/parsing";
    import Icon from 'svelte-awesome';
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

    let docs: any;
    let expandVariables = false;
    let expandClasses = false;
    let expandSound = false;
    let expandMidi = false;

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
    <p>The following documentation provides a comprehensive list of all Zen variables, classes and methods. It is intended as a reference whilst using Zen. If you are new to Zen, we recommend that you follow the <a href="/learn">tutorial</a> or load some examples in the <a href="/">code editor</a> first.</p>

    <section class="variables">
        <h2>Variables <button on:click={() => expandVariables = !expandVariables}><Icon data="{faCaretDown}" /></button></h2>

        <div class="expandable{expandVariables ? '--expanded' : ''}">
            <p>Zen exposes the following read-only variables:</p>
            <ul>
                <li><code class="inline-code">t</code> an integer representing time.</li>
                <li><code class="inline-code">q</code> the number of divisions per cycle. <code class="inline-code">t</code> increments <code class="inline-code">q</code> times per cycle.</li>
                <li><code class="inline-code">s</code> the size of the canvas.</li>
                <li><code class="inline-code">c</code> the current cycle.</li>
            </ul>
            <p><code class="inline-code">t</code>, <code class="inline-code">q</code>, and <code class="inline-code">s</code> can be manipulated using the Zen class <code class="inline-code">z</code>, see below.</p>
        </div>
    </section>

    <section class="classes">
        <h2>Classes <button on:click={() => expandClasses = !expandClasses}><Icon data="{faCaretDown}" /></button></h2>
        {#if docs}
            <div class="expandable{expandClasses ? '--expanded' : ''}">
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
            </div>
        {/if}
    </section>

    <section class="Sound">
        <h2>Sound <button on:click={() => expandSound = !expandSound}><Icon data="{faCaretDown}" /></button></h2>
        <div class="expandable{expandSound ? '--expanded' : ''}">
            {#each ['synth', 'sampler', 'granular'] as instrument}
                <span class="quick-link"><a href="/docs#{instrument}">{instrument}</a></span>
            {/each}
            {#each ['synth', 'sampler', 'granular'] as instrument}
                <div class="instrument">
                    <h3 id={instrument}>{instrument}</h3>
                </div>
            {/each}
        </div>
    </section>

    <section class="Midi">
        <h2>Midi <button on:click={() => expandMidi = !expandMidi}><Icon data="{faCaretDown}" /></button></h2>
        <div class="expandable{expandMidi ? '--expanded' : ''}">
        </div>
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

    .expandable {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.5s ease-in-out;
        &--expanded {
            max-height: auto;
        }
    }

    button {
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--color-theme-2);
        padding: 0;
    }
</style>