<script lang="ts">
    import Icon from 'svelte-awesome';
    import { faPlay, faStop, faFloppyDisk, faCode } from '@fortawesome/free-solid-svg-icons';
    import { play, stop } from '$lib/zen';
    import { isPlaying } from '$lib/stores/zen';
</script>

<div class="tools">
    <button on:click={() => { play(), isPlaying.set(true)}} class:active={$isPlaying}><Icon data="{faPlay}" /></button>
    <button on:click={() => { stop(), isPlaying.set(false)}}><Icon data="{faStop}" /></button>
    <button on:click={() => console.log('save')} class:active={false}><Icon data="{faFloppyDisk}" /></button>
    <button on:click={() => console.log('load')} class:active={false}><Icon data="{faCode}" /></button>
</div>

<style lang="scss">
    .tools {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        & button {
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
            &.active {
                color: var(--color-theme-1);
            }
        }
    }

</style>