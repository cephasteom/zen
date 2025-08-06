<script lang="ts">
    import { parseTSDocsText } from "$lib/utils/parsing";
    export let json: any;
    let selectedChild: string;
</script>

<div>
    {#each json.children as section}
        <div class="class">
            <h3 id={section.name.toLowerCase()}>{section.name}</h3>
            <p class="path">Defined in <a href={section.sources[0]?.url} target="_blank">{section.sources[0]?.fileName}</a></p>

            {#if section.children}
                {#each section.children as child}
                    {#if child.comment}
                        <p>{@html parseTSDocsText(child.comment.summary)}</p>
                        {#each child.comment.blockTags || [] as tag}
                            <span>{@html parseTSDocsText(tag.content)}</span>
                        {/each}
                    {/if}
                    
                    {#if child.children}
                        <div class="quick-links">
                            {#each child.children as link}
                            <button 
                                class="quick-link {selectedChild === link.name && 'active'}" 
                                on:click={() => selectedChild = link.name}>
                                    {link.name}
                                </button>
                            {/each}
                        </div>

                        {#each child.children as subChild}
                            <div class="class {subChild.name !== selectedChild && 'hidden'}">
                                <h4 id={subChild.name.toLowerCase()}>{subChild.name}</h4>
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
                                        {#if signature.comment}
                                            <p>{@html parseTSDocsText(signature.comment.summary)}</p>
                                            {#if signature.comment.blockTags}
                                                {#each signature.comment.blockTags as tag}
                                                    <span>{@html parseTSDocsText(tag.content)}</span>
                                                {/each}
                                            {/if}
                                        {/if}

                                        {#if signature.parameters}
                                            <ul>
                                                {#each signature.parameters as parameter}
                                                    <li>
                                                        {#if parameter.name}<strong>{parameter.name}</strong>{/if}: 
                                                        {#if parameter.comment}{@html parseTSDocsText(parameter.comment.summary)}{/if}
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    {/each}
                                {/if}
                            </div>
                        {/each}
                    {/if}
                {/each}
            {/if}
        </div>
    {/each}
</div>

<style lang="scss">
    .code {
        background-color: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }

    p {
        margin-top: 1rem;
    }

    ul {
        padding-left: 0;
    }
    li {
        margin-top: 0.5rem;
    }

    strong {
        font-family: 'Lato Bold';
    }

    .class {
        margin-bottom: 4rem;
    }

    .hidden {
        display: none;
    }

    .active {
        color: var(--color-yellow) !important;
    }

    .path {
        margin-top: 0.25rem;
        font-size: var(--text-sm);
        word-wrap: break-word;
    }

    .quick-links {
        display: flex;
        flex-wrap: wrap;
    }
    .quick-link {
        margin-right: 1rem;
        background-color: transparent;
        border: none;
        color: var(--color-theme-1);
        cursor: pointer;
        &:hover {
            text-decoration: underline;
            color: var(--color-yellow)
        }
    }
</style>
