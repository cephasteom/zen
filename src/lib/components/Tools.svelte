<script lang="ts">
    import { play, stop } from '$lib/zen';
</script>

<div class="tools">
    <button on:click={() => play()}>Play</button>
    <button on:click={() => stop()}>Stop</button>
    <span>Save</span>
    <span>Load</span>
</div>

<style lang="scss">
    .tools {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        & span, & button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-grey-light);
            font-size: var(--text-sm);
            font-family: var(--font-family);
            padding: 0;

            &:hover {
                color: var(--color-theme-1);

            }
        }
    }
</style>