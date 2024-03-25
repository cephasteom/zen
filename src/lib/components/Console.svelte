<script lang="ts">
    import { onMount } from "svelte";
    import { messages } from "$lib/stores/zen";

    let console: HTMLUListElement;

    onMount(() => {
        messages.subscribe(() => console && (console.scrollTop = console.scrollHeight));
    });
</script>

<div class="console">
    <ul bind:this={console}>
        {#each $messages as {type, message}}
            {#each message.split("\n") as line}
                <li class={type}>{line}</li>
            {/each}
        {/each}
    </ul>
</div>

<style lang="scss">
    .console {
        background-color: var(--color-grey-darkest);
        padding: 1.5rem 2rem;
        height: calc(100% - 3rem);
        position: absolute;
        left: 0;
        right: 0;
        overflow: hidden;
        user-select: text;
        border-radius: 10px;

    }

    ul {
        font-size: 12px;
        width: 100%;
        padding: 0;
        overflow-y: scroll;
        max-height: 100%;
    }

    li {
        font-family: Menlo, Monaco, "Courier New", monospace;
        font-weight: normal;
        font-size: 14px;
        font-feature-settings: "liga" 0, "calt" 0;
        font-variation-settings: normal;
        line-height: 21px;
        letter-spacing: 0px;
        margin:0;
        color: #d4d4d4;
        &::before {
            content: "»";
            color: #d4d4d4;
            margin-right: 0.5rem;
        }
    }

    .success {
        color: var(--color-theme-3);
    }

    .error {
        color: var(--color-theme-1);
    }
</style>