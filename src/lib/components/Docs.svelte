<script lang="ts">
    import { parseTSDocsText } from "$lib/utils/parsing";
    export let json: any;
</script>

<div>
    <div class="quick-links">
        {#each json.children as section}
            <span class="quick-link"><a href="/docs#{section.name.toLowerCase()}">{section.name}</a></span>
        {/each}
    </div>
    {#each json.children as section}
        <div class="class">
            <h3 id={section.name.toLowerCase()}>{section.name}</h3>
            <p class="path">Defined in <a href={section.sources[0]?.url} target="_blank">{section.sources[0]?.fileName}</a></p>

            {#if section.children}
                {#each section.children as child}
                    {#if child.comment}
                        <p>{@html parseTSDocsText(child.comment.summary)}</p>
                        {#each child.comment.blockTags as tag}
                            <span>{@html parseTSDocsText(tag.content)}</span>
                        {/each}
                    {/if}
                    
                    {#if child.children}
                        <div class="quick-links">
                            {#each child.children as link}
                                <span class="quick-link"><a href="/docs#{link.name.toLowerCase()}">{link.name}</a></span>
                            {/each}
                        </div>
                        {#each child.children as subChild}
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
                                    <p>{@html parseTSDocsText(signature.comment.summary)}</p>
                                    {#if signature.comment.blockTags}
                                        {#each signature.comment.blockTags as tag}
                                            <span>{@html parseTSDocsText(tag.content)}</span>
                                        {/each}
                                    {/if}

                                    {#if signature.parameters}
                                        <ul>
                                            {#each signature.parameters as parameter}
                                                <li>
                                                    {#if parameter.name}{parameter.name}{/if}: 
                                                    {#if parameter.comment}{@html parseTSDocsText(parameter.comment.summary)}{/if}
                                                </li>
                                            {/each}
                                        </ul>
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

    li {
        margin-top: 0.5rem;
    }

    .class {
        margin-bottom: 4rem;
    }

    .path {
        margin-top: 0.25rem;
        font-size: var(--text-xs);
        word-wrap: break-word;
    }

    .quick-links {
        display: flex;
        flex-wrap: wrap;
    }
    .quick-link {
        margin-right: 1rem;
        &:hover {
            text-decoration: underline;
            color: var(--color-yellow)
        }
    }
</style>
