<script lang="ts">
    import Icon from 'svelte-awesome';
    import { faPlay, faStop, faFloppyDisk, faCode } from '@fortawesome/free-solid-svg-icons';
    import { play, stop } from '$lib/zen';
    import { isPlaying } from '$lib/stores/zen';
    import Dialog from './Dialog.svelte'
    import Save from './Save.svelte'
    import Load from './Load.svelte'
    
    let save: HTMLDialogElement;
    let load: HTMLDialogElement;

</script>

<div class="tools">
    <button on:click={() => { play(), isPlaying.set(true)}} class:active={$isPlaying}><Icon data="{faPlay}" /></button>
    <button on:click={() => { stop(), isPlaying.set(false)}}><Icon data="{faStop}" /></button>
    <button on:click={() => save.showModal()} class:active={false}><Icon data="{faFloppyDisk}" /></button>
    <button on:click={() => load.showModal()} class:active={false}><Icon data="{faCode}" /></button>
</div>

<Dialog bind:dialog={save} on:close={() => save.close()}>
    <Save on:save={() => save.close()} />
</Dialog>

<Dialog bind:dialog={load} on:close={() => load.close()}>
    <Load on:load={() => load.close()}/>
</Dialog>

<svelte:window on:keydown={e => { 
    if(!e.metaKey || !['s', 'o'].includes(e.key)) return
    e.preventDefault()
    e.key === 's' && save.showModal();
    e.key === 'o' && load.showModal();
}} />

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