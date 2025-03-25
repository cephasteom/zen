<script lang="ts">
    import Icon from 'svelte-awesome';
    import { faPlay, faStop, faFloppyDisk, faCode, faGlobe, faChessBoard, faBars, faToggleOff } from '@fortawesome/free-solid-svg-icons';
    import { isPlaying, showCircuit, toggleCircuit, toggleVisuals, visualsType } from '$lib/stores/zen';
    import { isApp } from '$lib/utils/utils';
    import Dialog from './Dialog.svelte'
    import Save from './Save.svelte'
    import Load from './Load.svelte'

    const visualsIcons = {
        'grid': faChessBoard,
        'sphere': faGlobe,
        'none': faToggleOff
    }
    
    let save: HTMLDialogElement;
    let load: HTMLDialogElement;
</script>

<div class="tools">
    <button on:click={() => { isPlaying.set(!$isPlaying)}} ><Icon data="{$isPlaying ? faStop : faPlay}" /></button>
    {#if !isApp()}
        <button on:click={() => save.showModal()} class:active={false}><Icon data="{faFloppyDisk}" /></button>
        <button on:click={() => load.showModal()} class:active={false}><Icon data="{faCode}" /></button>
    {/if}
    <button class="tools__visuals" 
        class:active={$visualsType !== 'none'} 
        on:click={toggleVisuals}
    >
        <Icon data={visualsIcons[$visualsType] || visualsIcons.grid} />
    </button>
    <button class="tools__circuit" on:click={toggleCircuit} class:active={$showCircuit}>
        <Icon data={faBars} />
    </button>
</div>

<Dialog bind:dialog={save} on:close={() => save.close()}>
    <Save on:save={() => save.close()} />
</Dialog>

<Dialog bind:dialog={load} on:close={() => load.close()}>
    <Load on:load={() => load.close()}/>
</Dialog>

<svelte:window 
    on:keydown={e => { 
        if(!e.metaKey || !['s', 'o'].includes(e.key)) return
        e.preventDefault()
        e.key === 's' && save.showModal();
        e.key === 'o' && load.showModal();
    }} 
/>

<style lang="scss">
    .tools {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;

        & button {
            height: 1.5rem;
            @media(min-width: 600px) {
                height: 1rem;
            }
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-grey-light);
            font-size: var(--text-sm);
            font-family: var(--font-family);
            padding: 0;

            &.active {
                color: var(--color-theme-1);
            }
        }

        &__visuals, &__circuit, &__console {
            display: none;
            @media (min-width: 800px) {
                display: block;
            }
        }
    }

</style>