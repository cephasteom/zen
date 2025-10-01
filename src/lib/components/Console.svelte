<script lang="ts">
    import { onMount } from "svelte";
    import { messages } from "$lib/stores/zen";

    export let fullHeight: boolean = true;
    let console: HTMLUListElement;

    onMount(() => {
        messages.subscribe(() => {
            if (!console) return
            
            // wait for the next micro task to ensure that the DOM has updated before scrolling
            Promise.resolve().then(() => {
                console.scrollTop = console.scrollHeight;
            });
        });
    });
</script>

<div 
    class="console"
    class:console--fullHeight={fullHeight}
>
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
        position: absolute;
        height: calc(100% - 1.5rem);
        left: 0;
        right: 0;
        overflow: hidden;
        user-select: text;
        
        @media (min-width: 800px) {
            height: calc(100% - 3rem);
        }

        &--fullHeight {
            height: calc(100% - 1.5rem);
        }
    }

    ul {
        width: 100%;
        padding: 0;
        overflow-y: scroll;
        max-height: 100%;
    }

    li {
        font-family: Menlo, Monaco, "Courier New", monospace;
        font-weight: normal;
        font-size: var(--text-sm);
        font-feature-settings: "liga" 0, "calt" 0;
        font-variation-settings: normal;
        letter-spacing: 0px;
        margin:0;
        color: var(--color-white);
        &::before {
            content: "»";
            color: var(--color-white);
            margin-right: 0.5rem;
        }
    }

    .success {
        color: var(--color-theme-3);
    }

    .error {
        color: var(--color-theme-1);
    }

    .credit {
        color: var(--color-theme-2);
    }
</style>