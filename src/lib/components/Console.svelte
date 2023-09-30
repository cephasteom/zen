<script lang="ts">
    import { messages } from "$lib/stores/zen";
</script>

<div class="console">
    <ul>
        {#each $messages as message}
            <li>{message}</li>
        {/each}
    </ul>
</div>

<style lang="scss">
    .console {
        background-color: var(--color-grey-darkest);
        padding: 1.5rem 2rem;
        height: calc(100% - 3rem);
        width: 100%;
    }

    ul {
        font-size: 12px;
        width: 100%;
        padding: 0;
        overflow-y: scroll;
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
</style>